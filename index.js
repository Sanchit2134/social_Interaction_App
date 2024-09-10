import express, { urlencoded } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    };
app.use(cors(corsOptions));

const port = 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
})