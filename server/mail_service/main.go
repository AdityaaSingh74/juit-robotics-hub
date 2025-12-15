package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"

	"github.com/joho/godotenv"
)

type EmailRequest struct {
	Email       string `json:"email"`
	Name        string `json:"name"`
	EmailType   string `json:"emailType"`   // "submission", "approved", "rejected"
	ProjectName string `json:"projectName"` 
	Comments    string `json:"comments"` 
}

func MailSENDER(subject string, body string, to []string) error {
	from := os.Getenv("EMAIL")
	password := os.Getenv("PASSWORD")

	auth := smtp.PlainAuth(
		"",
		from,
		password,
		"smtp.gmail.com",
	)

	// Proper email formatting with headers
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		from, to[0], subject, body)

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

	log.Println("Email sent successfully to", to)
	return nil
}

// I used AI to write the body , 
func generateEmailContent(req EmailRequest) (string, string, error) {
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

func getCommentsSection(comments string) string {
	if comments != "" {
		return fmt.Sprintf("Admin Comments:\n%s\n", comments)
	}
	return ""
}

func sendEmailHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")  // update later if needed 
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

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

	if req.Email == "" || req.Name == "" || req.EmailType == "" {
		http.Error(w, "Bad request: email, name, and emailType are required", http.StatusBadRequest)
		return
	}

	subject, body, err := generateEmailContent(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = MailSENDER(subject, body, []string{req.Email})
	if err != nil {
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": fmt.Sprintf("%s email sent successfully", req.EmailType),
	})
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Validate environment variables
	if os.Getenv("EMAIL") == "" || os.Getenv("PASSWORD") == "" {
		log.Fatal("EMAIL and PASSWORD must be set in .env file")
	}

	http.HandleFunc("/api/send-email", sendEmailHandler)
	http.HandleFunc("/health", healthCheckHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	log.Printf("Go email service starting on port %s...", port)
	log.Printf("Endpoints:")
	log.Printf("  POST /api/send-email")
	log.Printf("  GET  /health")

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Failed to start server: %s", err)
	}
}
