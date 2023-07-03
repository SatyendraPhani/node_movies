const express = require("express");

const app = express();

app.use(express.json());

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const changingToCamelCase1 = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesList = `SELECT * 
                              FROM movie`;
  const moviesList = await db.all(getMoviesList);
  response.send(moviesList.map((eachMovie) => changingToCamelCase1(eachMovie)));
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovie = `INSERT INTO
                     movie (director_id , movie_name , lead_actor)
                     VALUES (
                        ${directorId},
                        '${movieName}',
                        '${leadActor}'
                        )`;
  const dbResponse = await db.run(movieDetails);
  response.send("Movie Successfully Added");
});

const changingToCamelCase2 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getTheMovie = `SELECT *
                    FROM movie 
                    WHERE movie_id = ${movieId}`;
  const theMovie = await db.get(getTheMovie);
  const oneMovie = changingToCamelCase2(theMovie);
  response.send(oneMovie);
});

app.put("/movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateTheMovieDetails = `UPDATE movie
                         SET director_id = ${directorId},
                         movie_name = '${movieName}' ,
                         lead_actor = '${leadActor}'
                WHERE movie_id = ${movieId};`;
  await db.run(updateTheMovieDetails);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `DELETE FROM 
                  movie 
                  WHERE movie_id = ${movieId}`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

const changingToCamelCase3 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectors = `SELECT * 
                        FROM director
                        ORDER BY director_id`;
  const allDirectors = await db.all(getDirectors);
  response.send(
    allDirectors.map((eachDirector) => changingToCamelCase3(eachDirector))
  );
});

const changingToCamelCase4 = (dbobject) => {
  return {
    movieName: dbobject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `SELECT * 
                     FROM movie
                     WHERE director_id = ${directorId};`;
  const allDirectorMovies = await db.all(getDirectorMovies);
  response.send(
    allDirectorMovies.map((eachDirectorBook) =>
      changingToCamelCase4(eachDirectorBook)
    )
  );
});

module.exports = app;
