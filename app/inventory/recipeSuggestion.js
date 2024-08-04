import {useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Grid, Card, CardContent } from '@mui/material';

const API_KEY = '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';

const RecipeSuggestions = ({ pantryItems }) => {
    const [recipes, setRecipes] = useState([]);
    const [showRecipes, setShowRecipes] = useState(false);

    const fetchRecipes = async () => {
      try {
        // Join pantry items into a comma-separated string
        const ingredients = pantryItems.map(item => item.id).join(',');
        // console.log('ingre',ingredients);
        const response = await fetch("https://openrouter.ai/api/v1", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3.1-8b-instruct:free",
                "messages": [
                    {
                        "role": "user",
                        "content": `Suggest recipes using the following ingredients: ${ingredients}`
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        setRecipes(data.choices.map(choice => choice.message.content)); // Adjust this based on the actual response structure
    } catch (error) {
        console.error('Error fetching recipes:', error);
        }
    };

    const handleClick = () => {
        fetchRecipes();
        setShowRecipes(true);
    }
  
    useEffect(() => {
      if (pantryItems.length > 0) {
        fetchRecipes();
      }
    }, [pantryItems]);
  
    console.log(recipes);
  return (
    <div>
      <button onClick={handleClick}>Get Recipe Suggestions</button>
      {showRecipes && (
        <div>
          {recipes.length > 0 ? (
            <ul>
              {recipes.map(recipe => (
                <li key={recipe.id}>
                  <h3>{recipe.title}</h3>
                  <img src={recipe.image} alt={recipe.title} style={{ width: '100px' }} />
                </li>
              ))}
            </ul>
          ) : (
            <p>No recipes found.</p>
          )}
        </div>
      )}
    </div>
  );
};
  
  export default RecipeSuggestions;