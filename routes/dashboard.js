const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { ensureAuthenticated } = require("../config/auth.js")
const Recipe = require("../models/recipe.js")
const User = require("../models/user.js")





//dashboard
router.get('/', ensureAuthenticated, async (req, res) => {

  const recipesItSelfes = new Array()
  try {
    const user = await User.findOne({ email: req.user.email }).exec()

    try {
      for await (const rid of user.recipes) {
        const recipe = await Recipe.findOne({ id: rid }).exec()
        recipesItSelfes.push(recipe)


      }
      res.render('dashboard', {
        user: req.user,
        recipesItSelfes: recipesItSelfes
      })
    } catch (err) {
      throw err
    }


  } catch (err) {
    throw err
  }





})

router.get('/viewRecipe', ensureAuthenticated, async (req, res) => {
  var id = req.query.id

  try {
    const recipe = await Recipe.findOne({ id: id }).exec()
    if (recipe) {

      res.render('viewRecipe', {
        recipe: recipe
      })
    }
  } catch (err) {
    throw err
  }


})







router.get('/createRecipe', ensureAuthenticated, (req, res) => {
  res.render('createRecipe', {
    user: req.user,

  })
})

router.post('/createRecipe', ensureAuthenticated, (req, res) => {

  const { recipeName, intro, ingredients, method, email } = req.body
  let errors = []

  if (!recipeName || !intro || !ingredients || !method) {
    errors.push({ msg: "Please fill in all fields" })
  }
  if (errors.length > 0) {
    res.render('createRecipe', {
      user: req.user,
      errors: errors,
      recipeName: recipeName,
      intro: intro,
      ingredients: ingredients,
      method: method
    })
  }
  else {
    //new recipe
    const newRecipe = new Recipe({
      name: recipeName,
      intro: intro,
      ingredients: ingredients,
      method: method,
      id: mongoose.mongo.ObjectId().toString()
    })
    newRecipe.save()

    User.findOne({ email: email }, function (err, user) {
      console.log(user)
      user.recipes.push(newRecipe.id)
      user.save()
    })

    res.redirect('/dashboard')
  }

})

module.exports = router 