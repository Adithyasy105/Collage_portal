import { PrismaClient } from "@prisma/client";
import { supabase } from '../config/supabaseClient.js';
const prisma = new PrismaClient();

/**
 * Get all staff/teachers for student to select from
 */
export const getStaffForLeave = async (req, res) => {
  try {
    // Get all staff with their user accounts (where user role is STAFF)
    const staffList = await prisma.staff.findMany({
      where: {
        user: {
          role: 'STAFF'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        department: {
          select: {
            name: true
          }
        }
      }
    });

    // Sort by user name
    const sortedStaffList = staffList.sort((a, b) => {
      const nameA = a.user?.name || a.employeeId || '';
      const nameB = b.user?.name || b.employeeId || '';
      return nameA.localeCompare(nameB);
    });

    const formattedStaff = sortedStaffList.map(staff => ({
      id: staff.id,
      staffId: staff.id,
      name: staff.user?.name || staff.employeeId || 'Unknown',
      email: staff.user?.email || '',
      designation: staff.designation || 'Teacher',
      department: staff.department?.name || 'General',
      employeeId: staff.employeeId
    }));

    res.json({ staff: formattedStaff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch staff", error: err.message });
  }
};

/**
 * Submit leave application (student)
 * Body: { staffId, startDate, endDate, reason, letter (file) }
 */
export const submitLeaveApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { staffId, startDate, endDate, reason } = req.body;

    if (!staffId || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "staffId, startDate, endDate, and reason are required" });
    }

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Verify staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(staffId) }
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    let letterUrl = null;

    // Upload leave letter if provided
    if (req.file) {
      try {
        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `leave_${student.id}_${Date.now()}.${fileExt}`;

        // Check if bucket exists first
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'leave-letters');
        
        if (!bucketExists) {
          console.warn("Bucket 'leave-letters' does not exist. Please create it in Supabase Storage.");
          // Continue without letter - application can be submitted without it
        } else {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('leave-letters')
            .upload(fileName, req.file.buffer, {
              contentType: req.file.mimetype,
              upsert: false,
            });

          if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            console.error("Error details:", JSON.stringify(uploadError, null, 2));
            // Continue without letter if upload fails (make it optional)
            console.warn("File upload failed, continuing without letter:", uploadError.message);
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('leave-letters')
              .getPublicUrl(fileName);
            
            letterUrl = urlData?.publicUrl || null;
            console.log("File uploaded successfully:", letterUrl);
          }
        }
      } catch (uploadErr) {
        console.error("File upload exception:", uploadErr);
        console.error("Exception stack:", uploadErr.stack);
        // Continue without letter if upload fails (make it optional)
        console.warn("File upload exception, continuing without letter");
      }
    }

    const leaveApplication = await prisma.leaveApplication.create({
      data: {
        studentId: student.id,
        staffId: parseInt(staffId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        letterUrl,
        status: 'PENDING'
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        staff: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({ 
      message: "Leave application submitted successfully",
      leaveApplication 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit leave application", error: err.message });
  }
};

/**
 * Get leave applications for student
 */
export const getStudentLeaveApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const applications = await prisma.leaveApplication.findMany({
      where: { studentId: student.id },
      include: {
        staff: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            department: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedApplications = applications.map(app => ({
      id: app.id,
      startDate: app.startDate,
      endDate: app.endDate,
      reason: app.reason,
      letterUrl: app.letterUrl,
      status: app.status,
      staffComments: app.staffComments,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      staff: {
        id: app.staff.id,
        name: app.staff.user.name,
        email: app.staff.user.email,
        designation: app.staff.designation,
        department: app.staff.department.name
      }
    }));

    res.json({ applications: formattedApplications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leave applications", error: err.message });
  }
};

/**
 * Get leave applications for staff (all applications sent to this staff member)
 */
export const getStaffLeaveApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const staff = await prisma.staff.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff profile not found" });
    }

    const applications = await prisma.leaveApplication.findMany({
      where: { staffId: staff.id },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            program: {
              select: {
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedApplications = applications.map(app => ({
      id: app.id,
      startDate: app.startDate,
      endDate: app.endDate,
      reason: app.reason,
      letterUrl: app.letterUrl,
      status: app.status,
      staffComments: app.staffComments,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      student: {
        id: app.student.id,
        rollNumber: app.student.rollNumber,
        name: app.student.user.name,
        email: app.student.user.email,
        program: app.student.program.name,
        programCode: app.student.program.code
      }
    }));

    res.json({ applications: formattedApplications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leave applications", error: err.message });
  }
};

/**
 * Approve or reject leave application (staff)
 * Body: { applicationId, action: 'APPROVED' | 'REJECTED', comments?: string }
 */
export const updateLeaveApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = req.params.applicationId; // Get from URL params: /api/leave/:applicationId/status
    const { action, comments } = req.body; // Get from request body

    console.log("Update leave application status:", { applicationId, action, comments, userId, body: req.body, params: req.params });

    if (!applicationId) {
      return res.status(400).json({ 
        message: "applicationId is required in URL",
        received: { applicationId, params: req.params, body: req.body }
      });
    }

    if (!action) {
      return res.status(400).json({ 
        message: "action is required in request body",
        received: { applicationId, action, body: req.body }
      });
    }

    if (action !== 'APPROVED' && action !== 'REJECTED') {
      return res.status(400).json({ 
        message: "action must be 'APPROVED' or 'REJECTED'",
        received: action 
      });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff profile not found" });
    }

    // Verify the application belongs to this staff member
    const application = await prisma.leaveApplication.findUnique({
      where: { id: parseInt(applicationId) },
      include: {
        staff: {
          select: { id: true }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ message: "Leave application not found" });
    }

    if (application.staff.id !== staff.id) {
      return res.status(403).json({ message: "You are not authorized to update this application" });
    }

    // Convert status to enum value
    const statusValue = action === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    
    const updated = await prisma.leaveApplication.update({
      where: { id: parseInt(applicationId) },
      data: {
        status: statusValue,
        staffComments: comments || null
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        staff: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({ 
      message: `Leave application ${action.toLowerCase()} successfully`,
      leaveApplication: updated 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update leave application", error: err.message });
  }
};
