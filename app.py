# ---------------- IMPORTS ----------------
import os
import uuid
import json
import sqlite3

from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash


# ---------------- APP SETUP ----------------
app = Flask(__name__)
app.secret_key = "secret123"


# ---------------- DATABASE INIT ----------------
def init_db():
    conn = sqlite3.connect("photo.db")
    cursor = conn.cursor()

    # USERS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        username TEXT UNIQUE,
        password TEXT
    )
    """)

    # GALLERY
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gallery(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        image_path TEXT
    )
    """)

    # SLIDESHOW
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS slideshow(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        data TEXT
    )
    """)

    conn.commit()
    conn.close()


# ---------------- HOME ----------------
@app.route("/")
def home():
    if "user_id" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


# ---------------- LOGIN ----------------
@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = sqlite3.connect("photo.db")
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM users WHERE username=?",
            (username,)
        )

        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user[3], password):
            session["user_id"] = user[0]
            session["username"] = user[2]
            return redirect(url_for("dashboard"))
        else:
           error =  "Invalid username or password "

    return render_template("login.html",error = error)


# ---------------- REGISTER ----------------
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name")
        username = request.form.get("username")
        password = request.form.get("password")

        if not name or not username or not password:
            return "All fields required ."

        conn = sqlite3.connect("photo.db")
        cursor = conn.cursor()

        try:
            hashed_password = generate_password_hash(password)

            cursor.execute(
                "INSERT INTO users(name, username, password) VALUES (?, ?, ?)",
                (name, username, hashed_password)
            )

            conn.commit()
        except sqlite3.IntegrityError:
            return "Username already exists ."

        conn.close()

        return redirect(url_for("login"))

    return render_template("register.html")


# ---------------- DASHBOARD ----------------
@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template("dashboard.html", username=session["username"])


# ---------------- LOGOUT ----------------
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ---------------- UPLOAD IMAGE ----------------
@app.route("/upload", methods=["POST"])
def upload():
    if "user_id" not in session:
        return "Unauthorized", 401

    file = request.files.get("image")

    if not file:
        return "No file uploaded", 400

    filename = str(uuid.uuid4()) + "_" + file.filename
    path = os.path.join("static/uploads", filename)

    os.makedirs("static/uploads", exist_ok=True)
    file.save(path)

    conn = sqlite3.connect("photo.db")
    conn.execute(
        "INSERT INTO gallery (user_id, image_path) VALUES (?, ?)",
        (session["user_id"], path)
    )
    conn.commit()
    conn.close()

    return "Uploaded"


# ---------------- GET GALLERY ----------------
@app.route('/get_gallery')
def get_gallery():
    conn = sqlite3.connect("photo.db")
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, image_path FROM gallery WHERE user_id=?",
        (session["user_id"],)
    )

    data = cursor.fetchall()
    conn.close()

    images = [{"id": row[0], "url": "/" + row[1]} for row in data]

    return jsonify(images)

# ----------------DELETE IMAGE ----------------
@app.route('/delete_image/<int:id>', methods=['DELETE'])
def delete_image(id):
    conn = sqlite3.connect("photo.db")
    cursor = conn.cursor()

    cursor.execute("SELECT image_path FROM gallery WHERE id=?", (id,))
    img = cursor.fetchone()

    if img:
        if os.path.exists(img[0]):
            os.remove(img[0])

    cursor.execute("DELETE FROM gallery WHERE id=?", (id,))
    conn.commit()
    conn.close()

    return jsonify({"status": "deleted"})
# ---------------- SLIDESHOW PAGE ----------------
@app.route("/slideshow")
def slideshow():
    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template("slideshow.html")


# ---------------- SAVE SLIDESHOW ----------------
@app.route("/save_slideshow", methods=["POST"])
def save_slideshow():
    if "user_id" not in session:
        return "Unauthorized", 401

    data = request.json
    name = data.get("name")

    if not name:
        return "Slideshow name required .", 400

    json_data = json.dumps({
        "images": data.get("images"),
        "time": data.get("time")
    })

    conn = sqlite3.connect("photo.db")
    conn.execute(
        "INSERT INTO slideshow (user_id, name, data) VALUES (?, ?, ?)",
        (session["user_id"], name, json_data)
    )
    conn.commit()
    conn.close()

    return "Slideshow saved"


# ---------------- GET ALL SLIDESHOWS ----------------
@app.route("/get_slideshows")
def get_slideshows():
    if "user_id" not in session:
        return jsonify([])

    conn = sqlite3.connect("photo.db")
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, name FROM slideshow WHERE user_id=?",
        (session["user_id"],)
    )

    data = cursor.fetchall()
    conn.close()

    return jsonify([{"id": r[0], "name": r[1]} for r in data])


# ---------------- GET ONE SLIDESHOW ----------------
@app.route("/get_slideshow/<int:id>")
def get_slideshow(id):
    if "user_id" not in session:
        return jsonify({})

    conn = sqlite3.connect("photo.db")
    cursor = conn.cursor()

    cursor.execute(
        "SELECT data FROM slideshow WHERE id=? AND user_id=?",
        (id, session["user_id"])
    )

    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify(json.loads(row[0]))

    return jsonify({})


# ---------------- RUN ----------------
if __name__ == "__main__":
    init_db()
    app.run(debug=True)