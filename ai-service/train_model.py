import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import pickle
import os

def train_and_save_model():
    print("Loading dataset...")
    df = pd.read_csv('dataset.csv')
    
    # We use a simple pipeline with CountVectorizer and LogisticRegression
    # This is a beginner-friendly approach to NLP classification
    pipeline = Pipeline([
        ('vectorizer', CountVectorizer(stop_words='english', lowercase=True)),
        ('classifier', LogisticRegression())
    ])
    
    print("Training model...")
    pipeline.fit(df['text'], df['label'])
    
    print("Model trained. Saving to phishing_model.pkl...")
    with open('phishing_model.pkl', 'wb') as f:
        pickle.dump(pipeline, f)
    
    print("Done!")

if __name__ == '__main__':
    train_and_save_model()
