"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Download, Trash2, Edit, LogOut, FileText, Calendar as CalendarIcon, Upload } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Resume {
  id: string
  version: string
  label: string
  date: string
  filename: string
  changelog: string
  isCurrent: boolean
  createdAt: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResume, setEditingResume] = useState<Resume | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<{
    date: Date | undefined
    filename: string
    changelog: string
    isCurrent: boolean
  }>({
    date: undefined,
    filename: "",
    changelog: "",
    isCurrent: false,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchResumes()
    }
  }, [status])

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes")
      const data = await response.json()
      setResumes(data)
    } catch (error) {
      console.error("Error fetching resumes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date) {
      toast.error("Please select a date")
      return
    }

    setUploading(true)
    
    try {
      let filename = formData.filename

      // Upload file if a new one is selected
      if (selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", selectedFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          toast.error(error.error || "Failed to upload file")
          setUploading(false)
          return
        }

        const uploadResult = await uploadResponse.json()
        filename = uploadResult.filename
      }

      // Create or update resume
      const url = editingResume
        ? `/api/resumes/${editingResume.id}`
        : "/api/resumes"
      
      const method = editingResume ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date.toISOString(),
          filename,
          changelog: formData.changelog,
          isCurrent: formData.isCurrent,
        }),
      })

      if (response.ok) {
        await fetchResumes()
        resetForm()
        setIsDialogOpen(false)
        toast.success(
          editingResume ? "Resume updated successfully" : "Resume created successfully"
        )
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to save resume")
      }
    } catch (error) {
      console.error("Error saving resume:", error)
      toast.error("An error occurred while saving the resume")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return
    
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchResumes()
        toast.success("Resume deleted successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete resume")
      }
    } catch (error) {
      console.error("Error deleting resume:", error)
      toast.error("An error occurred while deleting the resume")
    }
  }

  const handleEdit = (resume: Resume) => {
    setEditingResume(resume)
    setFormData({
      date: new Date(resume.date),
      filename: resume.filename,
      changelog: resume.changelog,
      isCurrent: resume.isCurrent,
    })
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingResume(null)
    setFormData({
      date: undefined,
      filename: "",
      changelog: "",
      isCurrent: false,
    })
    setSelectedFile(null)
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your resume versions
          </p>
        </div>
        <Button variant="outline" onClick={() => signOut()}>
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>

      <Separator className="my-8" />

      {/* Add Resume Button */}
      <div className="mb-6">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              Add Resume
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingResume ? "Edit Resume" : "Add New Resume"}
              </DialogTitle>
              <DialogDescription>
                {editingResume
                  ? "Update the resume details below"
                  : "Add a new resume version to your portfolio"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) =>
                        setFormData({ ...formData, date: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Version number will be automatically assigned based on this date
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Resume PDF</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setSelectedFile(file)
                      }
                    }}
                    required={!editingResume}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Upload className="size-3" />
                      {selectedFile.name}
                    </Badge>
                  )}
                </div>
                {editingResume && !selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Current file: {editingResume.filename}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="changelog">Changelog (Admin Only)</Label>
                <Textarea
                  id="changelog"
                  placeholder="Describe what changed in this version..."
                  value={formData.changelog}
                  onChange={(e) =>
                    setFormData({ ...formData, changelog: e.target.value })
                  }
                  required
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This will only be visible to you in the admin panel
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="current"
                  checked={formData.isCurrent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isCurrent: checked })
                  }
                />
                <Label htmlFor="current" className="cursor-pointer">
                  Mark as current resume
                </Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : (editingResume ? "Update" : "Create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumes List */}
      <div className="space-y-4">
        {resumes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="size-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No resumes yet. Add your first resume to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        Version {resume.version}
                      </CardTitle>
                      {resume.isCurrent && (
                        <Badge className="bg-primary text-primary-foreground">
                          Current
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      {format(new Date(resume.date), "MMMM yyyy")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <a 
                        href={resume.filename} 
                        download={`Resume - John Mulligan (${format(new Date(resume.date), "MMMM yyyy")}).pdf`}
                      >
                        <Download className="size-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(resume)}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(resume.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{resume.changelog}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  File: {resume.filename}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <Toaster />
    </div>
  )
}
