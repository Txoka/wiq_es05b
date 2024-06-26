import { TextField, Autocomplete, Avatar, Container, Paper, Typography, Table, TableContainer, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import grave from "../media/graveRanking.svg";
import Loader from "./components/Loader";
import ServiceDownMessage from "./components/ServiceDownMessage";

const baseFilters = [
  { filter: "totalPoints", displayed: "Points" },
  { filter: "totalTime", displayed: "Time" },
  { filter: "category", displayed: "Category" },
  { filter: "correct", displayed: "Correct ratio" },
]

const rowGenerator = (score, i) => {
  return (
    <TableRow key={i}>
      <TableCell><Avatar>{i + 1}</Avatar></TableCell>
      <TableCell><Typography>{score.user}</Typography></TableCell>
      <TableCell><Typography>{score.category}</Typography></TableCell>
      <TableCell align="right"><Typography>{score.totalTime} s</Typography></TableCell>
      <TableCell align="right"><Typography>{score.totalPoints}</Typography></TableCell> 
      <TableCell align="right"><Typography>{score.correct * 100}%</Typography></TableCell>
      <TableCell align="right"><Typography>{new Date(score.date).toLocaleDateString()}</Typography></TableCell>
    </TableRow>
  )
}

const RankingList = ({ scores, error }) => {
  if (error) {
    console.log(error)
    return <ServiceDownMessage grave={grave} code={error.status} reason={error.message} />
  }
  if (scores.length === 0)
    return <Typography variant="h5" align="center">No scores to show</Typography>
  return (
    <TableContainer component={Container}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell><Typography fontWeight="bold">User</Typography></TableCell>
            <TableCell><Typography fontWeight="bold">Category</Typography></TableCell>
            <TableCell align="right"><Typography fontWeight="bold">Time</Typography></TableCell>
            <TableCell align="right"><Typography fontWeight="bold">Points</Typography></TableCell>
            <TableCell align="right"><Typography fontWeight="bold">Correct Ratio</Typography></TableCell>
            <TableCell align="right"><Typography fontWeight="bold">Date</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            scores.map((score, i) => rowGenerator(score, i))
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const fetchRanking = async (order) => {
  try {
    const response = await axios.get(`/ranking/10?order=${order}`)
    return response.data;
  } catch (error) {
    return error.response;
  }
}

export default function Ranking() {
  const [scores, setScores] = useState();
  const [init, setInit] = useState(false); //To prevent error message from showing while fetching
  const [error, setError] = useState();
  const [filter, setFilter] = useState(baseFilters[0].filter);

  // Fetch the top 10 users at first render

  useEffect(() => {
    setInit(false);
    fetchRanking(filter)
      .then((response) => setScores(response))
      .catch((error) => setError({message: error.data.message, status: error.status}))
      .finally(() => setInit(true));
  }, [filter]);
  
  return (
    <Container style={{ paddingTop: "2rem" }}>
      <Paper
        elevation={3}
        style={{ padding: 16, margin: "auto" }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Global Ranking
        </Typography>
        { !init ? <Loader /> : (
          <Container sx={{display: "flex", flexFlow: "column", gap: "1rem"}}>
            <Autocomplete
              disablePortal
              options={baseFilters}
              getOptionLabel={(option) => option.displayed}
              sx={{ width: 200, alignSelf: "flex-end"}}
              onChange={(_, selected) => {
                setFilter(selected ? selected.filter : '');
              }}
              renderInput={(params) => <TextField {...params} label="Filter" />}
            />
            <RankingList scores={scores} error={error} />
          </ Container>
        ) }
      </Paper>
    </Container>
  );
}
