import express, { Request, Response } from 'express';
import session from 'express-session';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.DATABASE_CONNECT_URI as string);
interface IRedirect extends mongoose.Document {
    key: string;
    redirect: string;
    enabled: boolean;
}
const redirectSchema = new mongoose.Schema<IRedirect>({
    key: String,
    redirect: String,
    enabled: Boolean
});
const Redirect = mongoose.model<IRedirect>('Redirect', redirectSchema);

const app = express();
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', __dirname + "/views");
app.use(express.static(__dirname + "/static"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.COOKIE_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
declare module 'express-session' {
    interface SessionData {
        loggedin: boolean
    }
}

app.get('/', async (req: Request, res: Response) => {
    if (!req.session.loggedin) {
        return res.render('login', {
            title: 'Login',
            css: ['login.css'],
            js: ['login.js'],
        });
    }

    const redirects: IRedirect[] = await Redirect.find().lean();
    return res.render('dashboard', {
        title: 'Dashboard',
        css: [],
        js: ['dashboard.js'],
        base: `https://${req.headers.host}/`,
        redirects: redirects,
    });
});

app.post("/auth", (req: Request, res: Response) => {
    if (req.body.username !== process.env.APP_USERNAME || req.body.password !== process.env.APP_PASSWORD) {
        return res.sendStatus(403);
    } 

    req.session.loggedin = true;
    return res.sendStatus(204);
});

app.delete('/auth', async (req: Request, res: Response) => {
    req.session.loggedin = false;
    return res.sendStatus(204);
});

app.get("/:key", async (req: Request, res: Response) => {
    const redirect = await Redirect.findOne({
        key: req.params.key,
    });

    if (!redirect) {
        return res.render('error', {
            title: 'Error 404',
            css: ['error.css'],
            js: [],
            code: 404,
            message: 'Page Not Found'
        });
    }

    if (!redirect.enabled) {
        return res.render('error', {
            title: 'Error 423',
            css: ['error.css'],
            js: [],
            code: 423,
            message: 'That Redirect is Disabled'
        });
    }

    return res.redirect(redirect.redirect);
});

app.post('/:key', async (req: Request, res: Response) => {
    console.log(req.params, req.body);

    if (!req.session.loggedin) {
        return res.sendStatus(401);
    }

    const r = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);
    if (!r.test(req.body.redirect)) {
        return res.sendStatus(400);
    }

    const existing = await Redirect.findOne({key: req.params.key});
    if (existing) {
        return res.sendStatus(409);
    }

    try {
        const redirect = new Redirect({
            key: req.params.key,
            redirect: req.body.redirect,
            enabled: true
        });
        await redirect.save();

        return  res.sendStatus(204);
    } catch (e) {
        return res.sendStatus(400);
    }
});

app.get('/:key/json', async (req: Request, res: Response) => {
    if (!req.session.loggedin) {
        return res.sendStatus(401);
    }

    const redirect = await Redirect.findOne({key: req.params.key});
    if (!redirect) {
        return res.sendStatus(404);
    }

    return res.send(redirect);
});

app.patch("/:key/redirect", async (req: Request, res: Response) => {
    if (!req.session.loggedin) {
        return res.sendStatus(401);
    }

    const r = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);
    if (!r.test(req.body.redirect)) {
        return res.sendStatus(400);
    }

    const redirect = await Redirect.findOne({key: req.params.key});
    if (!redirect) {
        return res.sendStatus(404);
    }

    redirect.redirect = req.body.redirect;
    await redirect.save();
    
    return res.sendStatus(204);
});

app.patch("/:key/enabled", async (req: Request, res: Response) => {
    if (!req.session.loggedin) {
        return res.sendStatus(401);
    }

    const redirect = await Redirect.findOne({key: req.params.key});
    if (!redirect) {
        return res.sendStatus(404);
    }

    redirect.enabled = !redirect.enabled;
    await redirect.save();
    
    return res.sendStatus(204);
});

app.delete('/:key', async (req: Request, res: Response) => {
    if (!req.session.loggedin) {
        return res.sendStatus(401);
    }

    const op = await Redirect.deleteOne({key: req.params.key});
    if (op.deletedCount === 0) {
        return res.sendStatus(400);
    }
    
    return res.sendStatus(204);
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}.`);
});
