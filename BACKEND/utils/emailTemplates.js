/**
 * Premium, responsive HTML email templates for ProjectSphere.
 * Designed with a modern, high-contrast dark/light theme featuring indigo-cyan gradients,
 * clean typography (sans-serif), crisp cards, and highly-compatible CTA buttons for all clients.
 */

const baseTemplate = (title, content, ctaText = '', ctaUrl = '') => {
  const ctaButton = ctaText && ctaUrl
    ? `
    <table border="0" cellpadding="0" cellspacing="0" style="margin: 24px auto 0 auto; text-align: center;">
      <tr>
        <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);" bgcolor="#4f46e5">
          <a href="${ctaUrl}" target="_blank" style="border: 1px solid #4f46e5; border-radius: 12px; color: #ffffff; display: inline-block; font-family: sans-serif; font-size: 14px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 220px; -webkit-text-size-adjust: none; mso-hide: all;">
            ${ctaText}
          </a>
        </td>
      </tr>
    </table>`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        table {
          border-spacing: 0;
        }
        td {
          padding: 0;
        }
        img {
          border: 0;
        }
        .wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #f8fafc;
          padding-bottom: 40px;
        }
        .main {
          background-color: #ffffff;
          margin: 0 auto;
          width: 100%;
          max-width: 600px;
          border-spacing: 0;
          font-family: sans-serif;
          color: #334155;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          border: 1px solid #f1f5f9;
        }
        .header-gradient {
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          padding: 32px;
          text-align: center;
        }
        .logo-box {
          display: inline-block;
          background-color: rgba(255, 255, 255, 0.15);
          padding: 8px 16px;
          border-radius: 12px;
          color: #ffffff;
          font-weight: 900;
          font-size: 16px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .header-title {
          color: #ffffff;
          font-size: 22px;
          font-weight: 800;
          margin-top: 16px;
          margin-bottom: 0;
        }
        .content {
          padding: 32px 24px;
        }
        .card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #4f46e5;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }
        .card.success {
          border-left-color: #10b981;
          background-color: #f0fdf4;
        }
        .card.danger {
          border-left-color: #ef4444;
          background-color: #fef2f2;
        }
        .card.warning {
          border-left-color: #f59e0b;
          background-color: #fffbeb;
        }
        .card-title {
          font-weight: bold;
          font-size: 15px;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .card-value {
          font-size: 14px;
          color: #475569;
          line-height: 1.5;
        }
        .footer {
          background-color: #f1f5f9;
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .footer a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <center class="wrapper">
        <table class="main" width="100%">
          <tr>
            <td class="header-gradient">
              <div class="logo-box">ProjectSphere</div>
              <h1 class="header-title">${title}</h1>
            </td>
          </tr>
          <tr>
            <td class="content">
              ${content}
              ${ctaButton}
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p style="margin: 0 0 8px 0;">FYP Management Portal — ProjectSphere</p>
              <p style="margin: 0;">Need help? Contact department HOD or <a href="mailto:support@projectsphere.edu">Email Support</a></p>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
};

export const emailTemplates = {
  // 1. OTP Verification code
  otpEmail: (name, otpCode) => {
    return baseTemplate(
      'Verify Your Email Address',
      `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">Hi <strong>${name}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">Welcome to ProjectSphere! To proceed with your account registration or request, please verify your email address using the one-time passcode below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #4f46e5; border-radius: 16px; padding: 16px 36px; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #4f46e5;">
          ${otpCode}
        </span>
        <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Valid for 10 minutes. Do not share this OTP with anyone.</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 0;">If you did not initiate this request, you can safely ignore this email.</p>
      `
    );
  },

  // 2. Proposal Submitted confirmation
  proposalSubmitted: (studentName, projectTitle, domain) => {
    return baseTemplate(
      'Proposal Submitted Successfully',
      `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">Hi <strong>${studentName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">Your Final Year Project proposal has been logged successfully in our system and routed to the department HOD for preliminary review.</p>
      
      <div class="card">
        <div class="card-title">Project Details</div>
        <div class="card-value">
          <strong>Title:</strong> ${projectTitle}<br/>
          <strong>Domain:</strong> ${domain || 'N/A'}<br/>
          <strong>Submitted:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 0;">You will receive email status alerts when the HOD approves or rejects the initial concept. You can track this in real-time on your student dashboard.</p>
      `,
      'Track Project',
      'https://projectsphere-ai.netlify.app/student/dashboard'
    );
  },

  // 3. HOD Approved proposal
  proposalApproved: (studentName, projectTitle) => {
    return baseTemplate(
      '🎉 Proposal Approved by HOD',
      `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">Hi <strong>${studentName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">Excellent news! Your project proposal <strong>"${projectTitle}"</strong> has been approved by the Head of Department (HOD).</p>
      
      <div class="card success">
        <div class="card-title" style="color: #065f46;">Approval Status</div>
        <div class="card-value" style="color: #047857;">
          ✓ Approved at HOD Level.<br/>
          ✓ Awaiting Faculty Supervisor Assignment.<br/>
          You will be notified as soon as a mentor is officially assigned.
        </div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 0;">No action is required from your side at this moment. You can view the full details on your dashboard.</p>
      `,
      'View Proposal',
      'https://projectsphere-ai.netlify.app/student/dashboard'
    );
  },

  // 4. HOD Rejected proposal
  proposalRejected: (studentName, projectTitle, reason) => {
    return baseTemplate(
      'Proposal Revision Required',
      `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">Hi <strong>${studentName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">Your project proposal <strong>"${projectTitle}"</strong> has been reviewed and requires modifications before it can be accepted.</p>
      
      <div class="card danger">
        <div class="card-title" style="color: #991b1b;">Rejection/Revision Details</div>
        <div class="card-value" style="color: #b91c1c;">
          <strong>Feedback:</strong> ${reason}
        </div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 0;">Please log into the student portal, edit your proposal details based on the feedback above, and resubmit for HOD review.</p>
      `,
      'Edit Proposal',
      'https://projectsphere-ai.netlify.app/student/dashboard'
    );
  },

  // 5. Faculty Assigned (sent to Faculty)
  facultyAssigned: (facultyName, projectTitle, studentName) => {
    return baseTemplate(
      'New Supervised Project Assigned',
      `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">Dear Professor <strong>${facultyName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">You have been officially assigned by the Head of Department as the supervisor/mentor for a new student project:</p>
      
      <div class="card">
        <div class="card-title">Project Details</div>
        <div class="card-value">
          <strong>Title:</strong> ${projectTitle}<br/>
          <strong>Team Leader:</strong> ${studentName}<br/>
          <strong>Status:</strong> Assigned (Awaiting your acceptance)
        </div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 0;">Please log into your Faculty Dashboard to review and accept the proposal so the students can start uploading files and logging progress.</p>
      `,
      'Review Assignment',
      'https://projectsphere-ai.netlify.app/faculty/dashboard'
    );
  },

  // 6. Deadline Reminder (sent to Faculty / HOD)
  deadlineReminder: (facultyName, projectTitle, deadlineTitle, dueDate) => {
    return baseTemplate(
      'Upcoming Project Deadline Reminder',
      `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">Dear Professor <strong>${facultyName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">This is an automated alert reminding you of an upcoming project deadline for a team under your supervision:</p>
      
      <div class="card warning">
        <div class="card-title" style="color: #92400e;">Deadline Details</div>
        <div class="card-value" style="color: #b45309;">
          <strong>Project:</strong> ${projectTitle}<br/>
          <strong>Milestone:</strong> ${deadlineTitle}<br/>
          <strong>Due Date:</strong> ${new Date(dueDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 0;">Ensure your students are on track and prepare to review their uploads once submitted.</p>
      `,
      'Track Progress',
      'https://projectsphere-ai.netlify.app/faculty/dashboard'
    );
  },

  // 7. Rescheduled Deadline (sent to Faculty / HOD)
  rescheduledDeadline: (facultyName, projectTitle, deadlineTitle, oldDate, newDate) => {
    return baseTemplate(
      'Project Deadline Rescheduled',
      `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">Dear Professor <strong>${facultyName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">Please note that a deadline has been rescheduled for the project <strong>"${projectTitle}"</strong> under your supervision:</p>
      
      <div class="card warning">
        <div class="card-title" style="color: #92400e;">Rescheduled Milestone</div>
        <div class="card-value" style="color: #b45309;">
          <strong>Milestone:</strong> ${deadlineTitle}<br/>
          <span style="text-decoration: line-through; opacity: 0.6; display: block;">Old Date: ${new Date(oldDate).toLocaleDateString()}</span>
          <strong>New Date: ${new Date(newDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
        </div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 0;">The schedule has been adjusted across all student and supervisor portals.</p>
      `,
      'Check Deadlines',
      'https://projectsphere-ai.netlify.app/faculty/dashboard'
    );
  },

  // 8. Project Completion / Approval
  projectCompletion: (studentName, projectTitle, facultyName) => {
    return baseTemplate(
      '🎉 Project Completed successfully!',
      `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">Hi <strong>${studentName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hearty congratulations! Your final year project <strong>"${projectTitle}"</strong> has been reviewed by your supervisor <strong>${facultyName}</strong> and fully approved by the department HOD!</p>
      
      <div class="card success">
        <div class="card-title" style="color: #065f46;">Final Submission Cleared</div>
        <div class="card-value" style="color: #047857;">
          ✓ Final Report accepted.<br/>
          ✓ Prototype and artifacts fully verified.<br/>
          ✓ All grades and project logs closed successfully.
        </div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 0;">Congratulations on completing your graduation project milestone successfully!</p>
      `,
      'View Project File',
      'https://projectsphere-ai.netlify.app/student/dashboard'
    );
  }
};
