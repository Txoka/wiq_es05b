import { Button, Container, Divider, Paper, Typography, LinearProgress, Box } from "@mui/material";
import { useState, useEffect, useRef, Fragment, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProtectedComponent from "./components/ProtectedComponent";
import axios from "axios";
import { AuthContext } from "../App";
import coinImage from '../media/coin.svg';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

export default function Game() {

    const { category } = useParams();
    const { getUser } = useContext(AuthContext)

    //State storing all questions
    const [questions, setQuestions] = useState([]);

    // State to track the index of the current question
    const [current, setCurrent] = useState(0);

    // State to see correct answers
    // const [correctAnswers, setCorrectAnswers] = useState(0);

    // Linear time bar
    const initialTime = 10; // seconds

    const correctPoints = 100;
    const wrongPoints = -20;

    const [timeLeft, setTimeLeft] = useState(initialTime);

    const [progressBarPercent, setProgressBarPercent] = useState(0);

    const [pointsUpdated, setPointsUpdated] = useState(0);
    const [correctA, setCorrectA] = useState(0);
    const [wrongA, setWrongA] = useState(0);
    const timerId = useRef();

    const navigate = useNavigate();
    const startTime = performance.now();

    // Next question
    const next = useCallback(() => {
        if (current === questions.length - 1) {
            let endTime = performance.now();
            navigate("/endgame", { state: { points:pointsUpdated,correct:correctA,wrong:wrongA,time:endTime-startTime} });
        }

        setCurrent(current + 1);
        setTimeLeft(initialTime);
        setProgressBarPercent(0);
    }, [current, questions.length, initialTime, navigate]);

    // Timer
    useEffect(() => {
        if (initialTime) {
            timerId.current = window.setInterval(() => {
                setTimeLeft((prevProgress) => prevProgress - 1);
            }, 1000);

            return () => {
                clearInterval(timerId.current);
            };
        }
    }, []);

    // Update progress bar
    useEffect(() => {
        if (initialTime) {
            if (progressBarPercent < 100) {
                let updateProgressPercent = Math.round(
                    ((initialTime - (timeLeft - 1)) / initialTime) * 100
                );
                setProgressBarPercent(updateProgressPercent);
            }

            if (timeLeft === 0 && timerId.current) {
                next();
            }
        }
    }, [timeLeft, progressBarPercent, current, next]);


    //Fetch questions just at the beginning
    useEffect(() => {
        fetchQuestions(`${apiEndpoint}/questions/${category}/10`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Function to fetch questions
    const fetchQuestions = async (url) => {
        const {data} = await axios.get(url);
        setQuestions(data);
    }

    // Function to answer a question
    const answer = async (i) => {
        //Server-side validation
        const params = {
            token: getUser()["token"],
            id: questions[current]._id,
            answer: questions[current].options[i]
        }

        //Fetch correct answer
        let response;
        try{
            response = await axios.post(`${apiEndpoint}/game/answer`, params)
        }catch(error){
            console.log("Error fetching response");
        }

        // Mark in red the incorrect answers and in green the correct one
        const correct = questions[current].options.filter( o => o == response.data.answer);
        const correctIndex = questions[current].options.indexOf(correct[0]);

        if(i != correct) changeButtonColor(i, "red");

        changeButtonColor(correctIndex, "green");
        const newPoints = pointsUpdated + (i === correctIndex ? correctPoints : wrongPoints);
        setPointsUpdated(newPoints);
        (i === correctIndex ? setCorrectA(correctA+1) : setWrongA(wrongA+1) );

        setTimeout(() => {
            next();
        }, 200);

    }


    // Change button color
    const changeButtonColor = (i, color) => {
        const button = document.getElementById(`button${i}`);
        if(button != null){
            button.style.backgroundColor = color;
            setTimeout(() => {
                button.style.backgroundColor = "";
            }, 500);
        }
    }

    const buttonStyle = {
        height: "10rem",
        width: { xs: "auto", md: "10rem" },
        fontSize: "4rem"
    }

    const MiLinea = () => {
        if (progressBarPercent > 80) {
            return (<LinearProgress color="red" variant={"determinate"} value={progressBarPercent} />)
        } else {
            return (<LinearProgress color="light" variant={"determinate"} value={progressBarPercent} />)
        }

    }

    if (questions.length === 0)
        return null;

    return (
        <Fragment>
            <ProtectedComponent />
            <Container component="main" maxWidth="md" sx={{ marginTop: 4, display: "flex", flexDirection: { xs: "row", md: "column" } }}>
                <Box sx={{ ml: 1, display: "flex", alignItems: "center", marginLeft: "1000px" }}>
                    <Typography sx={{ fontWeight: 400, fontSize: "35px" }}>
                        {pointsUpdated}
                    </Typography>
                    <img src={coinImage} alt="Coin" style={{marginLeft: "10px"}}/>
                </Box>
                <Paper elevation={3} sx={{margin: "2rem 0", padding: "1rem"}}>
                    <Typography variant="h4">
                        {questions[current].statement}
                    </Typography>

                    <Divider sx={{margin: "10px 0"}}/>

                    {questions[current].options.map((option, i) => (
                        <Typography key={i} component="p" variant="h6">
                            {String.fromCharCode(97 + i).toUpperCase()}. {option}
                        </Typography>
                    ))}

                </Paper>

                <Paper elevation={3} sx={{padding: "1rem", marginBottom: "2rem"}}>

                    <Box sx={{ml: 1, display: "flex", margin: "5px" }}>
                        <Typography sx={{ fontWeight: 400, fontSize: "15px" }}>
                            Time left: {timeLeft}
                        </Typography>
                    </Box>

                    <Box sx={{ margin: "10px" }}>
                        <MiLinea />
                    </Box>

                </Paper>

                <Container sx={{ display: "flex", justifyContent: "space-around", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "stretch" } }} >
                    <Button id="button0" color="dark" variant="contained" sx={buttonStyle} onClick={() => answer(0)}>A</Button>
                    <Button id="button1" color="light" variant="contained" sx={buttonStyle} onClick={() => answer(1)}>B</Button>
                    <Button id="button2" color="dark" variant="contained" sx={buttonStyle} onClick={() => answer(2)}>C</Button>
                    <Button id="button3" color="light" variant="contained" sx={buttonStyle} onClick={() => answer(3)}>D</Button>
                </Container>
            </Container>
        </Fragment>
    )
}