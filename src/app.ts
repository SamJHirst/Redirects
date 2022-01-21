import express, { NextFunction, Request, Response } from 'express';
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
    if (req.session.loggedin) {
        const redirects: IRedirect[] = await Redirect.find().lean();
        res.render('dashboard', {
            title: 'Dashboard',
            css: [],
            js: [
                'dashboard.js'
            ],
            base: `https://${req.headers.host}/`,
            redirects: redirects
        });
    } else {
        res.render('login', {
            title: 'Login',
            css: [
                'login.css'
            ],
            js: [
                'login.js'
            ]
        });
    }
});

app.get('/logout', (req: Request, res: Response) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get("/:key", async (req: Request, res: Response, next: NextFunction) => {
    const redirect: IRedirect | null = await Redirect.findOne({
        key: req.params.key
    });
    if (redirect) {
        if (redirect.enabled) {
            res.redirect(redirect.redirect);
        } else {
            res.render('error', {
                title: 'Error 423',
                css: [
                    'error.css'
                ],
                js: [],
                code: 423,
                message: 'That Redirect is Disabled'
            });
        }
    } else {
        next();
    }
});

app.get('*', (req: Request, res: Response) => {
    res.render('error', {
        title: 'Error 404',
        css: [
            'error.css'
        ],
        js: [],
        code: 404,
        message: 'Page Not Found'
    });
});

app.post("/login/", (req: Request, res: Response) => {
    if (req.body.username === process.env.APP_USERNAME && req.body.password === process.env.APP_PASSWORD) {
        req.session.loggedin = true;
        res.sendStatus(204);
    } else {
        res.sendStatus(403);
    }
});

app.post('/add/', async (req: Request, res: Response) => {
    if (req.session.loggedin) {
        const r = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

        if (r.test(req.body.redirect)) {
            const existing: IRedirect | null = await Redirect.findOne({
                key: req.body.key
            });
            if (!existing) {
                const redirect: IRedirect = new Redirect({
                    key: req.body.key,
                    redirect: req.body.redirect,
                    enabled: true
                });
                redirect.save().then(() => {
                    res.sendStatus(204);
                }).catch(() => {
                    res.sendStatus(400);
                });
            } else {
                res.sendStatus(409);
            }
        } else {
            res.sendStatus(400);
        }
    } else {
        res.sendStatus(401);
    }
});

app.post('/get/', async (req: Request, res: Response) => {
    if (req.session.loggedin) {
        const redirect: IRedirect | null = await Redirect.findOne({
            key: req.body.key
        });
        if (redirect) {
            res.send(redirect);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(401);
    }
});

app.post("/edit/", async (req: Request, res: Response) => {
    if (req.session.loggedin) {
        const r = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);

        if (r.test(req.body.redirect)) {
            const redirect: IRedirect | null = await Redirect.findOne({
                key: req.body.key
            });
            if (redirect) {
                redirect.redirect = req.body.redirect;
                await redirect.save();
                res.sendStatus(204);
            } else {
                res.sendStatus(404);
            }
        } else {
            res.sendStatus(400);
        }
    } else {
        res.sendStatus(401);
    }
});

app.post("/toggle/", async (req: Request, res: Response) => {
    if (req.session.loggedin) {
        const redirect: IRedirect | null = await Redirect.findOne({
            key: req.body.key
        });
        if (redirect) {
            redirect.enabled = !redirect.enabled;
            await redirect.save();
            res.sendStatus(204);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(401);
    }
});

app.post('/delete/', (req: Request, res: Response) => {
    if (req.session.loggedin) {
        Redirect.deleteOne({
            key: req.body.key
        }).then((resp) => {
            if (resp.deletedCount > 0) {
                res.sendStatus(204);
            } else {
                res.sendStatus(400);
            }
        });
    } else {
        res.sendStatus(401);
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}.`);
});