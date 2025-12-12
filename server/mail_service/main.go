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
	Email string `json:"email"`
	Name  string `json:"name"`
}

func MailSENDER(subject string, body string, to []string) error {
	from := os.Getenv("EMAIL") // add EMAIL in .env 
	password := os.Getenv("PASSWORD") // add PASSWORD in .env (App password not your password else it will give auth errr when running)
	
	auth := smtp.PlainAuth(
		"",
		from,
		password,
		"smtp.gmail.com",
	)
	
	msg := "Subject:" + subject + "\n" + body
	
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
	
	log.Println("Confirmation email sent successfully to", to)
	return nil
}

// function to send the email
func sendEmailHandler(w http.ResponseWriter, r *http.Request) {
	// set CORS headers to allow requests from the frontend
	w.Header().Set("Access-Control-Allow-Origin", "*")] // will change in future , works for now
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight OPTIONS request
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
	
	if req.Email == "" || req.Name == "" {
		http.Error(w, "Bad request: email and name are required", http.StatusBadRequest)
		return
	}
	
	subject := "Project Submission Confirmation"
	body := fmt.Sprintf("Hi %s,\n\nThank you for submitting your project idea to the JUIT Robotics Hub. We have received it and will review it shortly.\n\nBest regards,\nThe JUIT Robotics Hub Team", req.Name)
	
	err := MailSENDER(subject, body, []string{req.Email})
	if err != nil {
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}
	
w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Email sent successfully"})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	http.HandleFunc("/api/send-email", sendEmailHandler)
	
	port := "3001"
	log.Printf("Go server starting on port %s...", port)
	
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Failed to start server: %s", err)
	}
}
