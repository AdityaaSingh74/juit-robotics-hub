package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type EmailRequest struct {
	Email              string   `json:"email"`
	Name               string   `json:"name"`
	EmailType          string   `json:"emailType"`   // "submission", "approved", "rejected", "faculty_notification"
	ProjectName        string   `json:"projectName"`
	Comments           string   `json:"comments"`
	StudentEmail       string   `json:"studentEmail,omitempty"`
	StudentName        string   `json:"studentName,omitempty"`
	RollNumber         string   `json:"rollNumber,omitempty"`
	Branch             string   `json:"branch,omitempty"`
	Year               string   `json:"year,omitempty"`
	Category           string   `json:"category,omitempty"`
	Description        string   `json:"description,omitempty"`
	ResourcesArray     []string `json:"resourcesArray,omitempty"`
	ResourceDescription string   `json:"resourceDescription,omitempty"`
}

// Faculty heads emails - EDIT HERE to add/remove faculty
var FACULTY_EMAILS = []string{
	"aman.sharma@juitsolan.in",      // Faculty Head 1
	"241030221@juitsolan.in",      // Faculty Head 1
	"vikas.baghel@juitsolan.in",      // Faculty Head 2
	"shruti.jain@juitsolan.in",      // Faculty Head 3
}

// Allowed origins for CORS
var allowedOrigins = map[string]bool{
	"http://localhost:5173":           true, // Local dev
	"http://localhost:3000":           true, // Alternative local port
	"http://127.0.0.1:5173":           true, // Localhost alternative
	"https://juit-robotics-hub.vercel.app": true, // Production Vercel URL
}

func isOriginAllowed(origin string) bool {
	// Allow localhost in development
	if strings.Contains(origin, "localhost") || strings.Contains(origin, "127.0.0.1") {
		return true
	}
	// Check against allowed production origins
	return allowedOrigins[origin]
}

func MailSENDER(subject string, body string, to []string) error {
	from := os.Getenv("EMAIL")
	password := os.Getenv("PASSWORD")

	if from == "" || password == "" {
		return fmt.Errorf("EMAIL or PASSWORD environment variables not set")
	}

	auth := smtp.PlainAuth(
		"",
		from,
		password,
		"smtp.gmail.com",
	)

	// Proper email formatting with headers
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		from, strings.Join(to, ", "), subject, body)

	err := smtp.SendMail(
		"smtp.gmail.com:587",
		auth,
		from,
		to,
		[]byte(msg),
	)

	if err != nil {
		log.Printf("Failed to send email: %v", err)
		return err
	}

	log.Printf("Email sent successfully to %d recipient(s)", len(to))
	return nil
}

// generateStudentEmailContent creates email for students
func generateStudentEmailContent(req EmailRequest) (string, string, error) {
	var subject, body string

	switch req.EmailType {
	case "submission":
		subject = "Project Submission Confirmation - JUIT Robotics Hub"
		body = fmt.Sprintf(`Hi %s,

Thank you for submitting your project idea to the JUIT Robotics Hub.

We have received your submission and our team will review it shortly. You will receive an update within 3-5 business days.

Project Details:
- Project Name: %s

If you have any questions, feel free to reach out to us.

Best regards,
The JUIT Robotics Hub Team`, req.Name, req.ProjectName)

	case "approved":
		subject = "Your Project Has Been Approved!"
		body = fmt.Sprintf(`Hi %s,

Great news! Your project "%s" has been approved by the JUIT Robotics Hub team.

%s

Next Steps:
1. You will receive further instructions via email
2. Our team will reach out to you regarding project implementation
3. Join our community workspace for collaboration

Congratulations on this achievement!

Best regards,
The JUIT Robotics Hub Team`, req.Name, req.ProjectName, getCommentsSection(req.Comments))

	case "rejected":
		subject = "Update on Your Project Submission"
		body = fmt.Sprintf(`Hi %s,

Thank you for submitting your project "%s" to the JUIT Robotics Hub.

After careful review, we regret to inform you that your project has not been selected at this time.

%s

We encourage you to:
- Refine your proposal based on the feedback
- Submit a new project idea in the future
- Participate in our workshops and community events

We appreciate your interest in the JUIT Robotics Hub and hope to see more submissions from you.

Best regards,
The JUIT Robotics Hub Team`, req.Name, req.ProjectName, getCommentsSection(req.Comments))

	default:
		return "", "", fmt.Errorf("invalid email type: %s", req.EmailType)
	}

	return subject, body, nil
}

// generateFacultyEmailContent creates email for faculty when new project is submitted
func generateFacultyEmailContent(req EmailRequest) (string, string, error) {
	if req.EmailType != "faculty_notification" {
		return "", "", fmt.Errorf("invalid email type for faculty: %s", req.EmailType)
	}

	subject := "New Project Submission for Review - JUIT Robotics Hub"

	// Format resources as a list
	resourcesStr := ""
	if len(req.ResourcesArray) > 0 {
		for i, resource := range req.ResourcesArray {
			if i > 0 {
				resourcesStr += "\n  - "
			} else {
				resourcesStr = "- "
			}
			resourcesStr += resource
		}
	}

	body := fmt.Sprintf(`New Project Submission - Faculty Review Required

========== PROJECT SUBMISSION DETAILS ==========

Student Information:
- Name: %s
- Email: %s
- Roll Number: %s
- Branch: %s
- Year: %s

Project Information:
- Title: %s
- Category: %s

Project Description:
%s

Required Lab Resources:
%s

Resource Requirements Details:
%s

================================================

Please review this submission and provide feedback.
You can approve or reject this project through the admin dashboard.

Best regards,
JUIT Robotics Hub Automated System`,
		req.StudentName,
		req.StudentEmail,
		req.RollNumber,
		req.Branch,
		req.Year,
		req.ProjectName,
		req.Category,
		req.Description,
		resourcesStr,
		req.ResourceDescription,
	)

	return subject, body, nil
}

func getCommentsSection(comments string) string {
	if comments != "" {
		return fmt.Sprintf("Admin Comments:\n%s\n", comments)
	}
	return ""
}

func sendEmailHandler(w http.ResponseWriter, r *http.Request) {
	// CORS handling
	origin := r.Header.Get("Origin")
	if isOriginAllowed(origin) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	}
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Max-Age", "86400")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req EmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate based on email type
	if req.EmailType == "faculty_notification" {
		// Faculty notification requires different fields
		if req.ProjectName == "" || req.StudentEmail == "" || req.StudentName == "" {
			http.Error(w, "Bad request: projectName, studentEmail, and studentName are required for faculty notification", http.StatusBadRequest)
			return
		}
	} else {
		// Student emails require these fields
		if req.Email == "" || req.Name == "" {
			http.Error(w, "Bad request: email and name are required", http.StatusBadRequest)
			return
		}
	}

	if req.EmailType == "" {
		http.Error(w, "Bad request: emailType is required", http.StatusBadRequest)
		return
	}

	var subject, body string
	var err error
	var targetEmails []string

	if req.EmailType == "faculty_notification" {
		subject, body, err = generateFacultyEmailContent(req)
		targetEmails = FACULTY_EMAILS
	} else {
		subject, body, err = generateStudentEmailContent(req)
		targetEmails = []string{req.Email}
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = MailSENDER(subject, body, targetEmails)
	if err != nil {
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": fmt.Sprintf("%s email sent successfully to %d recipient(s)", req.EmailType, len(targetEmails)),
	})
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Note: No .env file found, using environment variables")
	}

	// Validate environment variables
	if os.Getenv("EMAIL") == "" || os.Getenv("PASSWORD") == "" {
		log.Fatal("EMAIL and PASSWORD must be set in .env file or environment variables")
	}

	http.HandleFunc("/api/send-email", sendEmailHandler)
	http.HandleFunc("/health", healthCheckHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	log.Printf("Go email service starting on port %s...", port)
	log.Printf("Environment:")
	if os.Getenv("RAILWAY_ENVIRONMENT_NAME") != "" {
		log.Printf("  Mode: Railway Production")
	} else {
		log.Printf("  Mode: Local Development")
	}
	log.Printf("Endpoints:")
	log.Printf("  POST /api/send-email")
	log.Printf("  GET  /health")
	log.Printf("Faculty notification emails (%d recipients):", len(FACULTY_EMAILS))
	for i, email := range FACULTY_EMAILS {
		log.Printf("  %d. %s", i+1, email)
	}

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Failed to start server: %s", err)
	}
}
