# Cloud Native Static App

This project demonstrates a static website deployed using:

- Docker
- GitHub Actions (CI/CD)
- Kubernetes

## Features
- Simple static website
- Containerized using Nginx
- Ready for CI/CD pipeline


## Architecture

User → GitHub → GitHub Actions → Docker Hub → Kubernetes (Minikube)

## Workflow

1. Code pushed to GitHub
2. GitHub Actions builds Docker image
3. Image pushed to Docker Hub
4. Kubernetes pulls latest image
5. Application deployed via Minikube

## Technologies Used

- HTML, CSS, JavaScript
- Docker
- GitHub Actions
- Kubernetes (Minikube)