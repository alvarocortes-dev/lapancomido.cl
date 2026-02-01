// src/middlewares/validateCredentials.js

const validateCredentials = (req, res, next) => {
    const { mail, password } = req.body;
    if (!mail || !password) {
        return res.status(400).json({ error: 'Faltan credenciales: mail y/o password.' });
    }
    next();
};

export default validateCredentials;
