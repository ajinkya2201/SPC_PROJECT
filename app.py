from flask import Flask, render_template, request, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

# create Database and Tables

def init_db():
    conn = sqlite3.connect("photo.db")
    cursor = conn.cursor()

    cursor.execute("""
    create table if not exists users(
    id integer primary key autoincrement,
    name text,
    username text unique,
    password text
    )
    """)

    conn.commit()
    conn.close()


app = Flask(__name__)

users = []  
@app.route("/")
def home():
    return redirect(url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
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
            return "Login Successful"
        else:
            return "Invalid credentials"

    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name")
        username = request.form.get("username")
        password = request.form.get("password")

        conn = sqlite3.connect("photo.db")
        cursor = conn.cursor()

        try:
            hashed_password = generate_password_hash(password)

            cursor.execute(
            "insert into users(name,username,password) values(?,?,?)",
            (name, username, hashed_password)
            )

            conn.commit()
        except sqlite3.IntegrityError:
            return "Username already exsits"

        conn.close()
        

        return redirect(url_for("login"))

    return render_template("register.html")


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
