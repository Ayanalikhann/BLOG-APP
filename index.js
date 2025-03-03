import fs from "fs";
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Temporary storage
let posts = [];

app.get("/", (req, res) => {
    res.render("index.ejs", { posts });
});

app.get("/create", (req, res) => {
    res.render("create.ejs");
});

app.post("/submit", (req, res) => {
    const { heading, describe, oldTitle } = req.body;
    const filePath = path.join(__dirname, "views", `${heading}.ejs`);

    if (oldTitle) {
        // Edit existing post
        posts = posts.map(post =>
            post.title === oldTitle ? { title: heading } : post
        );

        fs.unlinkSync(path.join(__dirname, "views", `${oldTitle}.ejs`)); // Delete old file
    } else {
        // Create new post
        posts.push({ title: heading });
    }

    // Write updated content
    fs.writeFile(filePath, `<h1>${heading}</h1><p>${describe}</p>`, (err) => {
        if (err) throw err;
        console.log("File created/updated successfully");
    });

    res.redirect("/");
});

// Route to display a post
app.get("/:postTitle", (req, res) => {
    const { postTitle } = req.params;
    const filePath = path.join(__dirname, "views", `${postTitle}.ejs`);

    if (fs.existsSync(filePath)) {
        res.render(postTitle);
    } else {
        res.status(404).send("Post not found");
    }
});

// Route to edit a post
app.get("/edit/:postTitle", (req, res) => {
    const { postTitle } = req.params;
    res.render("edit.ejs", { postTitle });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
