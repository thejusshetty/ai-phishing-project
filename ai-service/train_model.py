import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import pickle
import os

def train_and_save_model():
    dataset_path = os.path.join(os.path.dirname(__file__), 'dataset.csv')
    print(f"Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)

    print(f"Loaded {len(df)} sample texts across classes (0: legitimate, 1: phishing).")

    # TF-IDF Pipeline with unigrams and bigrams for strong phrase capture
    pipeline = Pipeline([
        ('vectorizer', TfidfVectorizer(
            stop_words='english',
            lowercase=True,
            ngram_range=(1, 2),
            sublinear_tf=True
        )),
        ('classifier', LogisticRegression(C=2.0, max_iter=1000, random_state=42))
    ])

    print("Training NLP classification model...")
    pipeline.fit(df['text'], df['label'])

    model_output = os.path.join(os.path.dirname(__file__), 'phishing_model.pkl')
    print(f"Model trained successfully. Saving to {model_output}...")
    with open(model_output, 'wb') as f:
        pickle.dump(pipeline, f)

    # Test quick predictions
    test_samples = [
        "Hey, are we still meeting tomorrow? https://zoom.us/j/123",
        "URGENT: Verify your Amazon password immediately or account suspended http://amazon00.com/login"
    ]
    for sample in test_samples:
        pred = pipeline.predict([sample])[0]
        prob = pipeline.predict_proba([sample])[0][1] * 100
        print(f"Sample: '{sample[:40]}...' -> Pred: {pred} (Phishing Probability: {prob:.1f}%)")

    print("Done!")

if __name__ == '__main__':
    train_and_save_model()
