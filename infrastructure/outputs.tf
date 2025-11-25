output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.w3sbot.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.w3sbot.public_dns
}

output "private_key_pem" {
  description = "Private key in PEM format for SSH access"
  value       = tls_private_key.w3schools.private_key_pem
  sensitive   = true
}

