const historyServiceUrl = process.env.HISTORY_SERVICE_URL || "http://localhost:8004";
const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:8001";

module.exports = (app, axios, errorHandler, authMiddleware) => {
  app.get("/history/get/:userId", authMiddleware, (req, res) => {
    const { userId } = req.params
    const { page, limit } = req.query

    let url = `${historyServiceUrl}/get/${userId}`

    if(!isNaN(parseInt(page)) && !isNaN(parseInt(limit))) {
      url += `?page=${page}&limit=${limit}`
    }

    axios
      .get(url)
      .then(response => res.status(response.status).json(response.data))
      .catch(error =>
        errorHandler(error, res, "An error occurred while fetching user history"))
  })

  app.get("/history/get/:userId/:id", authMiddleware, (req, res) => {
    const { userId, id } = req.params

    axios
      .get(`${historyServiceUrl}/get/${userId}/${id}`)
      .then(response => res.status(response.status).json(response.data))
      .catch(error =>
        errorHandler(error, res, "An error occurred while fetching user history"))
  })

  app.post("/history/create", authMiddleware, (req, res) => {
    const { userId, category } = req.body

    axios
      .post(`${historyServiceUrl}/create`, { userId, category })
      .then(response => res.status(response.status).json(response.data))
      .catch(error =>
        errorHandler(error, res, "An error occurred while creating the save"))
  })

  app.post("/history/add/:id", (req, res) => {
    const { id } = req.params
    const { last, statement, options, answer, correct, time, points } = req.body

    axios
      .post(`${historyServiceUrl}/add/${id}`, { last, statement, options, answer, correct, time, points })
      .then(response => res.status(response.status).json(response.data))
      .catch(error =>
        errorHandler(error, res, "An error occurred while creating the save"))
  })

  app.get("/ranking/:n", (req, res) => {
    const { order } = req.query

    // Forward the get ranking request to the user service

    let url = `${historyServiceUrl}/ranking/${req.params.n}`
    axios.get(order ? url + `?order=${encodeURIComponent(order)}`: url)
      .then(async response => {
        response.data = await Promise.all(response.data.map(async record => {
          try {
            let response = await axios.get(`${userServiceUrl}/user/${record.userId}`)
            delete record.userId
            record.user = response.data.username
            return record
          } catch (error) { throw(error) }
        }))
        res.status(response.status).json(response.data)
      })
      .catch(error => errorHandler(error, res, "An error occured while fetching the ranking"))
  })
}