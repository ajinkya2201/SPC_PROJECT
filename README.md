# Image Gallery and Slideshow Web App(Flask and SQLite)


## Overview: 

This project is a web-based image gallery and slideshow application built using Flask (Python) and SQLite.

User can:
    * Register and Log in securely
    * Upload Images from their Local Storage
    * View Uploaded Images in gallery
    * Select Images using drag-and-drop
    * Create and play the Slideshow

## Features

    # Authentication
        * User Registration 
        * Secure Login using hashed passwords
        * Session-based authentication
        * Logout functionality

    # Image Upload & Storage
        * Upload multiple images from local storage
        * Images saved in static/uploads/
        * File names stored in SQLite database

    # Gallery
        * Displays all uploaded images
        * Images fetched dynamically from database
        * Delete images using double-click

    # Slideshow
        * Drag-and-drop images into slideshow area
        * Reorder images dynamically
        * Remove images from slideshow
        * Start slideshow (stored temporarily in browser)

    # User Session
        * User-specific data (each user sees their own images)
        * Username displayed in dashboard
        * Session persists across navigation

## Tech stack 

    * Frontend 
        - HTML , CSS ,Javascript
    
    * Backend
        - Flask(Python)

    * Database
        - SQLite

    

## Database Schema

# User
    - id (PK)
    - name
    - username (UNIQUE)
    - password (hashed)

# gallery
    
    - id (PK)
    - user_id (FK)
    - image_path

# slideshow

    - id (PK)
    - user_id (FK)
    - name
    - data


## Flow

    User Registers -> Login
            |
            |
        Session created
            |
            |
        Upload Images
            |
            |
    Images stored(folder + DB)
            |
            |
    Gallery loads  images
            |
            |
    User selects images
            |
            |
     SlideShow created


## How to Run

  - python app.py

  - open browser
    http://127.0.0.1:5000