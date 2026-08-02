import mongoose from 'mongoose';

const projectProposalSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    title: { type: String, required: true, minlength: 10, maxlength: 120 },
    description: { type: String, required: true, minlength: 100, maxlength: 1000 },
    department: { type: String, enum: ['Computer Science', 'Electrical', 'Mechanical Polytechnic', 'BCA', 'BBA', 'MBA', 'MCA', 'B.Ed', 'M.Ed'], required: true },
    domain: { type: String, trim: true, default: '' },
    teamSize: { type: Number, default: 1 },
    teamMembers: [{
      name: String,
      email: String,
      mobileNumber: String,
      course: String,
      branch: String,
      section: String,
    }],
    referenceLinks: [String],
    targets: [{
      title: String,
      description: String,
      status: { type: String, enum: ['Completed', 'Ongoing', 'Pending'], default: 'Pending' },
      createdAt: { type: Date, default: Date.now }
    }],
    finalSubmission: {
      liveLink: String,
      githubLink: String,
      linkedinLink: String,
      submittedAt: Date,
      status: {
        type: String,
        enum: ['Not Submitted', 'Under HOD Review', 'Under Faculty Review', 'Accepted', 'Rejected'],
        default: 'Not Submitted'
      },
      rejectionReason: String,
    },
    projectType: {
      type: String,
      enum: ['Application', 'Research Paper'],
      default: 'Application'
    },
    deadlineSubmissions: [
      {
        deadlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deadline', required: true },
        status: { type: String, enum: ['Submitted', 'Late Submission', 'Pending Submission', 'Deadline Missed'], default: 'Pending Submission' },
        submittedAt: Date
      }
    ],
    submissionHistory: [
      {
        liveLink: String,
        githubLink: String,
        linkedinLink: String,
        submittedAt: Date,
        version: Number,
        reviewerName: String,
        reviewerRole: String,
        rejectionReason: String,
        requiredCorrections: String,
        reviewedAt: Date
      }
    ],
    supervisorRequested: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [
        'Pending HOD Review',
        'Pending Faculty Assignment',
        'HOD Approved',
        'Rejected (HOD)',
        'Faculty Assigned',
        'Faculty Accepted',
        'Rejected (Faculty)',
        'Submitted',
      ],
      default: 'Pending HOD Review',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    hodReview: {
      action: String,
      comment: String,
      reviewedAt: Date,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Hod' },
    },
    assignedFaculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    facultyReview: {
      action: String,
      comment: String,
      reviewedAt: Date,
    },
    // Faculty feedback log — appended over time
    facultyFeedback: [
      {
        message: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
      },
    ],
    // Real-time progress timeline updates
    timeline: [
      {
        status: {
          type: String,
          enum: ['PROTOTYPE CREATED', 'PROJECT STARTED', 'PROJECT COMPLETE', 'REPORT PREPARED', 'PROJECT SUBMITTED'],
          required: true
        },
        timestamp: { type: Date, default: Date.now },
        remarks: { type: String, default: '' },
        facultyComment: { type: String, default: '' }
      }
    ],
    // Linked deadline (optional)
    deadline: { type: mongoose.Schema.Types.ObjectId, ref: 'Deadline' },
    // Individual extensions on global deadlines
    extendedDeadlines: [
      {
        deadlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deadline' },
        extendedDate: { type: Date, required: true }
      }
    ],
    privateNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

export const ProjectProposal = mongoose.model('ProjectProposal', projectProposalSchema);
