const express = require("express");
const app = express();
const {
    engine
} = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const secretKey = "error500jajaja"
const {
    nuevoSkater,
    getSkaters,
    getSkater,
    actualizarSkater,
    borrarSkater,
    setSkaterStatus
} = require("./consultas");

//levantando el servicio
app.listen(3000, () => console.log("Servicio Levantado en http://localhost:3000"));

app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(
    expressFileUpload({
        limits: 5000000,
        abortOnLimit: true,
        responseOnLimit: "El tamaño de la imagen supera el límite permitido",
    })
);
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
    "handlebars",
    engine({
        defaultLayout: "main",
        layoutsDir: `${__dirname}/views/mainLayout`,
    })
);
app.set("view engine", "handlebars");

// Rutas
app.get("/", async (req, res) => {
    try {
        const skaters = await getSkaters()
        res.render("Home", {
            skaters
        });
    } catch (e) {
        res.status(500).send({
            error: `UUPSS Algo no esta bien... ${e}`,
            code: 500
        })
    };
});

app.get("/registro", (req, res) => {
    res.render("Registro");
});

app.get("/perfil", (req, res) => {
    const {
        token
    } = req.query
    jwt.verify(token, secretKey, (err, skater) => {
        if (err) {
            res.status(500).send({
                error: `UUPSS Algo no esta bien...`,
                message: err.message,
                code: 500
            })
        } else {
            res.render("Perfil", {
                skater
            });
        }
    })
});

app.get("/login", (req, res) => {
    res.render("Login");
});

app.post("/login", async (req, res) => {
    const {
        email,
        password
    } = req.body
    try {
        const skater = await getSkater(email, password)
        const token = jwt.sign(skater, secretKey)
        res.status(200).send(token)
    } catch (e) {
        console.log(e)
        res.status(500).send({
            error: `UUPSS Algo no esta bien... ${e}`,
            code: 500
        })
    };
});

app.get("/Admin", async (req, res) => {
    try {
        const skaters = await getSkaters();
        res.render("Admin", {
            skaters
        });
    } catch (e) {
        res.status(500).send({
            error: `UUPSS Algo no esta bien... ${e}`,
            code: 500
        })
    };
});


// API REST de Skaters

app.get("/skaters", async (req, res) => {

    try {
        const skaters = await getSkaters()
        res.status(200).send(skaters);
    } catch (e) {
        res.status(500).send({
            error: `UUPSS Algo no esta bien... ${e}`,
            code: 500
        })
    };
});

app.post("/skaters", async (req, res) => {
    const skater = req.body;
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send("No se encontro ningun archivo");
    }
    const {
        files
    } = req
    const {
        foto
    } = files;
    const {
        name
    } = foto;
    const pathPhoto = `/uploads/${name}`
    foto.mv (`${__dirname}/public${pathPhoto}`, async (err) => {
        try {
            if (err) throw err
            skater.foto = pathPhoto
            await nuevoSkater(skater);
            res.status(201).redirect("/login");
        } catch (e) {
            console.log(e)
            res.status(500).send({
                error: `UUPSS Algo no esta bien... ${e}`,
                code: 500
            })
        };

    });
})

app.put("/skaters", async (req, res) => {
    const skater = req.body;
    try {
        await actualizarSkater(skater);
        res.status(200).send("Datos actualizados satisfactoriamente");
    } catch (e) {
        res.status(500).send({
            error: `UUPSS Algo no esta bien... ${e}`,
            code: 500
        })
    };
});

app.put("/skaters/status/:id", async (req, res) => {
    const {
        id
    } = req.params;
    const {
        estado
    } = req.body;
    try {
        await setSkaterStatus(id, estado);
        res.status(200).send("Estatus actualizado");
    } catch (e) {
        res.status(500).send({
            error: `UUPSS Algo no esta bien... ${e}`,
            code: 500
        })
    };
});

app.delete("/skaters/:id", async (req, res) => {
    const {
        id
    } = req.params
    try {
        await borrarSkater(id)
        res.status(200).send();
    } catch (e) {
        res.status(500).send({
            error: `UUPSS Algo no esta bien... ${e}`,
            code: 500
        })
    };
});