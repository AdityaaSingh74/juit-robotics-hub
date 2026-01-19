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
	"241033001@juitsolan.in",     
	"241030316@juitsolan.in",
	// "aman.sharma@juitsolan.in",    
	// "vikas.baghel@juitsolan.in",      
	// "shruti.jain@juitsolan.in",      
}

func MailSENDER(subject string, body string, to []string) error {
	from := os.Getenv("EMAIL")
	password := os.Getenv("PASSWORD")

	log.Printf("[EMAIL_DEBUG] Starting email send...")
	log.Printf("[EMAIL_DEBUG] FROM: %s", from)
	log.Printf("[EMAIL_DEBUG] PASSWORD set: %v", password != "")
	log.Printf("[EMAIL_DEBUG] TO: %v", to)

	if from == "" || password == "" {
		error_msg := "EMAIL or PASSWORD environment variables not set"
		log.Printf("[EMAIL_ERROR] %s", error_msg)
		return fmt.Errorf(error_msg)
	}

	log.Printf("[EMAIL_DEBUG] Creating SMTP auth...")
	auth := smtp.PlainAuth(
		"",
		from,
		password,
		"smtp.gmail.com",
	)

	// Proper email formatting with headers
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		from, strings.Join(to, ", "), subject, body)

	log.Printf("[EMAIL_DEBUG] Connecting to smtp.gmail.com:587...")
	err := smtp.SendMail(
		"smtp.gmail.com:587",
		auth,
		from,
		to,
		[]byte(msg),
	)

	if err != nil {
		log.Printf("[EMAIL_ERROR] SMTP SendMail failed: %v", err)
		log.Printf("[EMAIL_ERROR] Error type: %T", err)
		return err
	}

	log.Printf("[EMAIL_SUCCESS] Email sent successfully to %d recipient(s): %v", len(to), to)
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

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Max-Age", "3600")
}

// sendEmailAsync sends email in background goroutine
func sendEmailAsync(subject string, body string, to []string, emailType string) {
	go func() {
		log.Printf("[ASYNC_TASK] Background goroutine started for %s", emailType)
		err := MailSENDER(subject, body, to)
		if err != nil {
			log.Printf("[ASYNC_ERROR] Background email send failed for %s: %v", emailType, err)
		} else {
			log.Printf("[ASYNC_SUCCESS] Background email sent successfully for %s", emailType)
		}
	}()
}

// testEmailHandler - for debugging email credentials
func testEmailHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost && r.Method != http.MethodGet {
		log.Printf("[ERROR] Invalid method for test: %s", r.Method)
		http.Error(w, "Invalid request method. Use GET or POST", http.StatusMethodNotAllowed)
		return
	}

	log.Printf("[TEST_EMAIL] Testing email credentials...")

	from := os.Getenv("EMAIL")
	password := os.Getenv("PASSWORD")

	w.Header().Set("Content-Type", "application/json")

	if from == "" {
		response := map[string]string{"error": "EMAIL environment variable not set", "status": "FAIL"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		log.Printf("[TEST_EMAIL_ERROR] EMAIL not set")
		return
	}

	if password == "" {
		response := map[string]string{"error": "PASSWORD environment variable not set", "status": "FAIL"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		log.Printf("[TEST_EMAIL_ERROR] PASSWORD not set")
		return
	}

	log.Printf("[TEST_EMAIL] EMAIL found: %s", from)
	log.Printf("[TEST_EMAIL] PASSWORD found: (length: %d)", len(password))

	// Try to connect to SMTP
	log.Printf("[TEST_EMAIL] Attempting SMTP connection to gmail...")
	err := MailSENDER(
		"[TEST] JUIT Robotics Hub - Email Credentials Test",
		"If you received this email, your credentials are working correctly!",
		[]string{from},
	)

	if err != nil {
		log.Printf("[TEST_EMAIL_FAILED] Test failed: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error":  err.Error(),
			"status": "FAIL",
			"email":  from,
		})
		return
	}

	log.Printf("[TEST_EMAIL_SUCCESS] Test passed! Email sent to %s", from)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Test email sent successfully to " + from,
		"status":  "SUCCESS",
		"email":   from,
	})
}

func sendEmailHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	log.Printf("[REQUEST] Received %s request", r.Method)

	// Handle preflight requests
	if r.Method == http.MethodOptions {
		log.Printf("[REQUEST] Preflight OPTIONS request")
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		log.Printf("[ERROR] Invalid method: %s", r.Method)
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req EmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[ERROR] Failed to decode JSON: %v", err)
		http.Error(w, "Bad request: "+err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("[REQUEST] Decoded request - EmailType: %s", req.EmailType)

	// Validate based on email type
	if req.EmailType == "faculty_notification" {
		// Faculty notification requires different fields
		if req.ProjectName == "" || req.StudentEmail == "" || req.StudentName == "" {
			log.Printf("[VALIDATION] Missing required fields for faculty notification")
			http.Error(w, "Bad request: projectName, studentEmail, and studentName are required for faculty notification", http.StatusBadRequest)
			return
		}
	} else {
		// Student emails require these fields
		if req.Email == "" || req.Name == "" {
			log.Printf("[VALIDATION] Missing required fields for student email")
			http.Error(w, "Bad request: email and name are required", http.StatusBadRequest)
			return
		}
	}

	if req.EmailType == "" {
		log.Printf("[VALIDATION] EmailType not specified")
		http.Error(w, "Bad request: emailType is required", http.StatusBadRequest)
		return
	}

	var subject, body string
	var err error
	var targetEmails []string

	if req.EmailType == "faculty_notification" {
		log.Printf("[PROCESS] Generating faculty notification email")
		subject, body, err = generateFacultyEmailContent(req)
		targetEmails = FACULTY_EMAILS
	} else {
		log.Printf("[PROCESS] Generating student email")
		subject, body, err = generateStudentEmailContent(req)
		targetEmails = []string{req.Email}
	}

	if err != nil {
		log.Printf("[ERROR] Failed to generate email content: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("[PROCESS] Email content generated for %d recipient(s)", len(targetEmails))

	// Send email asynchronously - don't block the response
	log.Printf("[PROCESS] Queuing async email task")
	sendEmailAsync(subject, body, targetEmails, req.EmailType)

	// Return success immediately
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := map[string]string{
		"message": fmt.Sprintf("%s email queued successfully for %d recipient(s)", req.EmailType, len(targetEmails)),
	}
	json.NewEncoder(w).Encode(response)
	log.Printf("[RESPONSE] Sent success response to client")
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Note: No .env file found, using environment variables")
	}

	// Validate environment variables
	emailAddr := os.Getenv("EMAIL")
	password := os.Getenv("PASSWORD")

	if emailAddr == "" {
		log.Fatal("[FATAL] EMAIL environment variable not set")
	}
	if password == "" {
		log.Fatal("[FATAL] PASSWORD environment variable not set")
	}

	log.Printf("[STARTUP] EMAIL configured: %s", emailAddr)
	log.Printf("[STARTUP] PASSWORD configured: ***hidden***")

	http.HandleFunc("/api/send-email", sendEmailHandler)
	http.HandleFunc("/api/test-email", testEmailHandler)
	http.HandleFunc("/health", healthCheckHandler)

	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT environment variable not set")
	}


	log.Printf("======================================")
	log.Printf("Go email service starting on port %s", port)
	log.Printf("======================================")
	log.Printf("Environment:")
	if os.Getenv("RAILWAY_ENVIRONMENT_NAME") != "" {
		log.Printf("  Mode: Railway Production")
	} else {
		log.Printf("  Mode: Local Development")
	}
	log.Printf("Endpoints:")
	log.Printf("  POST /api/send-email (main)")
	log.Printf("  GET  /api/test-email (debug - test credentials)")
	log.Printf("  POST /api/test-email (debug - test credentials)")
	log.Printf("  GET  /health")
	log.Printf("CORS: Allowing all origins (*)")
	log.Printf("Email Sending: Asynchronous (non-blocking)")
	log.Printf("Faculty notification emails (%d recipients):", len(FACULTY_EMAILS))
	for i, email := range FACULTY_EMAILS {
		log.Printf("  %d. %s", i+1, email)
	}
	log.Printf("======================================")

	addr := "0.0.0.0:" + port
	log.Printf("[STARTUP] Binding server to %s", addr)

	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("Failed to start server: %s", err)
	}

}
