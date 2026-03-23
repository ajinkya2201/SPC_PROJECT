from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

users = []  
@app.route("/")
def home():
    return redirect(url_for("register"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        # check in database
        # if correct → login user

    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name")
        username = request.form.get("username")
        password = request.form.get("password")

        users.append({
            "name": name,
            
            "username": username,
            
            "password": password
        })

        return redirect(url_for("login"))

    return render_template("register.html")


if __name__ == "__main__":
    app.run(debug=True)
