const express = require('express');
const router = express.Router();
const db = require("../models");
const bcrypt = require('bcrypt');
const checkAuth = require('../checkAuthClient');

// renders athlete register page
router.get("/register", (req, res) => {
  res.render("athlete-reg", {
    locals: { 
      error: 'whoops',
    }
  })
});

// register page for athletes 
router.post('/register', async (req, res) => {
  const clients = await db.Client.findAll({
    where: {
      email: req.body.email
    }
  })

//checks to see if client exists already with email
  if (clients.length) {
    res.status(422).render('athlete-reg', {
      locals: { error: 'email already in use' }
    })
  }

// checks to see all fields were filled out
  if (!req.body.email || !req.body.firstName || !req.body.lastName || !req.body.password) {
    return res.status(422).render('athlete-reg', {
      locals: {error: 'please include all required fields'}
    })
  } 

// hashes password
  const hash = await bcrypt.hash(req.body.password, 10);
// create new client and assign it to variable
  const newclient = await db.Client.create({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hash
  })

  // res.json(newclient);
  .then((result) => {
    res.redirect('/athlete/login')
  })
})

// renders home page and runs middleware 
router.get('/home', checkAuth, (req, res) => {
  res.render('athlete_home', {
    locals: { title: "Athlete Home" },
    partials: {head: 'partials/head'}
  })
})

// renders login page
router.get('/login', (req, res) => {
  res.render('athlete_login', {
    locals: { error: null }
  })
})

// lets athlete user login and creates session
router.post('/login', async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.render('athlete_login', {
      locals: {
          error: 'Please submit all required field'
      }
  })
  return;
  }
// checking to make sure clients email isnt taken
  const client = await db.Client.findOne({
    where: {
      email: req.body.email
    }
  })
  if (!client) {
    return res.status(404).render('athlete_login', {
      locals: { error: 'could not find user with that email'}
    })
  }

  //compare client input and password
  const match = await bcrypt.compare(req.body.password, client.password)
  //throw error if wrong
  if (match) {
    req.session.client = client;
  } else {
    return res.status(401).render('athlete_login', {
      locals: { error: 'incorrect password' }
    })
  }
  // renders athlete based on their id and renders their page
  res.render("athlete_home", {
    locals: {
      error: null,
      title: "Athlete Profile",
    },
    partials: {
      head: '/partials/head'
    }
    
  });
})
// renders all workouts - might not need this in athlete page
router.get('/allworkouts', checkAuth, async (req, res) => {
  const data = await db.Workout.findAll({
    where: {
      ClientId: req.session.client.id
    }
  })
    res.render("athlete_home", {
      locals: {
        error: null,
        title: "Athlete Profile",
        workouts: data
      },
      partials: {
        head: '/partials/head'
      }
  })
})

// displays workout based on client to workout id
router.get('/:id', async (req, res) => {
  // const {id} = req.session.client;
  const data = await db.Workout.findAll({
    where: {
      ClientId: req.session.client.id     //{id}
  }
})
    res.render('athlete_workout_plan', {
      locals: {
        error: null,
        title: 'Athlete Workouts',
        workouts: data
      },
      partials: {
        head: '/partials/head'
      }
    })
})

router.get('/setcoach/:id', checkAuth, (req, res) => {
  db.Coach.findByPk(req.params.id)
  .then((coach) => {
    if (!coach) {
      res.status(404).json({
        error: 'could not find a coach with that id'
      })
    } else {
      db.Client.findByPk(req.session.client.id)
      .then((client) => {
        client.setCoach(coach)
        res.render('athlete-hub')
      })
    }
  })
})

// logout function


module.exports = router;


//set workouts
// router.get('/workouts/:id', checkAuth, (req, res) => {
//   const client = req.session.client;
//   db.Workout.findByPk(req.params.id)
//   .then((workout) => {
//     if (!workout) {
//       res.status(404).json({
//         error: 'client has no workouts'
//       })
//     } else {
//         db.Client.findByPk(req.session.client.id)
//         .then((client) => {
//           client.setWorkout(workout)
//         })
//     }
//   })
// })