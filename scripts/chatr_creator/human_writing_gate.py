import argparse
import json
import re
import os

BANNED_PHRASES = [
    "in today's rapidly evolving world",
    "let me tell you something",
    "did you know that",
    "here are five things",
    "game-changing",
    "revolutionary",
    "disruptive innovation",
    "ai is transforming",
    "the future is here",
    "welcome to today's",
    "in this video we will",
    "make sure to like and subscribe",
    "without further ado"
]

INFORMAL_WORDS = {"yaar", "literally", "honestly", "okay", "damn", "dude", "bro", "like", "btw", "omg", "crazy"}
CORPORATE_WORDS = {"leverage", "utilize", "synergy", "paradigm", "landscape", "pivotal", "seamless", "innovative", "optimal"}
EMOTION_WORDS = {"surprised", "confused", "amazing", "insane", "hilarious", "crazy", "wow", "unbelievable", "sad", "angry", "happy", "shocked", "mind-blowing"}
FIRST_PERSON = {"i", "me", "my", "we", "us", "our", "i'm", "we're", "i've", "we've"}
CONTRACTIONS = {"don't", "can't", "won't", "it's", "that's", "there's", "they're", "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't", "hadn't", "doesn't", "didn't"}

def calculate_humanity(text, words, sentences):
    score = 50
    lower_words = [w.lower() for w in words]
    
    # Contractions
    contractions_count = sum(1 for w in lower_words if w in CONTRACTIONS)
    score += (contractions_count / max(len(words), 1)) * 500
    
    # First-person pronouns
    first_person_count = sum(1 for w in lower_words if w in FIRST_PERSON)
    score += (first_person_count / max(len(words), 1)) * 300
    
    # Informal words
    informal_count = sum(1 for w in lower_words if w in INFORMAL_WORDS)
    score += (informal_count / max(len(words), 1)) * 500
    
    # Corporate words penalty
    corporate_count = sum(1 for w in lower_words if w in CORPORATE_WORDS)
    score -= (corporate_count / max(len(words), 1)) * 1000
    
    # Sentence length variance
    sent_lengths = [len(s.split()) for s in sentences if s.strip()]
    if len(sent_lengths) > 1:
        mean_len = sum(sent_lengths) / len(sent_lengths)
        variance = sum((l - mean_len) ** 2 for l in sent_lengths) / len(sent_lengths)
        score += min(variance * 2, 20)
        
    return max(0, min(100, int(score)))

def calculate_novelty(text, words, sentences):
    score = 50
    if not sentences: return score
    
    first_sentence = sentences[0].lower()
    # Hook strength
    if '?' in first_sentence:
        score += 20
    if len(first_sentence.split()) < 10:
        score += 10
        
    # Generic openers penalty
    if first_sentence.startswith("this is") or first_sentence.startswith("here is"):
        score -= 15
        
    return max(0, min(100, int(score)))

def calculate_curiosity(text, words, sentences):
    score = 40
    # Questions
    score += text.count('?') * 15
    
    # Incomplete info hooks
    lower_text = text.lower()
    hooks = ["here's why", "what if", "the truth about", "secret", "find out", "wait till"]
    for hook in hooks:
        if hook in lower_text:
            score += 10
            
    return max(0, min(100, int(score)))

def calculate_emotion(text, words, sentences):
    score = 30
    lower_words = [w.lower() for w in words]
    
    # Emotion words
    emotion_count = sum(1 for w in lower_words if w in EMOTION_WORDS)
    score += emotion_count * 15
    
    # Exclamation
    score += text.count('!') * 10
    
    return max(0, min(100, int(score)))

def calculate_specificity(text, words, sentences):
    score = 40
    
    # Numbers
    numbers_count = len(re.findall(r'\b\d+\b', text))
    score += numbers_count * 10
    
    # Capitalized words (excluding start of sentences)
    capitalized_count = len(re.findall(r'(?<!\.\s)\b[A-Z][a-z]+\b', text))
    score += capitalized_count * 5
    
    return max(0, min(100, int(score)))

def analyze_script(text):
    text = text.strip()
    words = re.findall(r"\b[\w']+\b", text)
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    banned_found = [p for p in BANNED_PHRASES if p.lower() in text.lower()]
    if banned_found:
        return {
            'status': 'REJECTED',
            'humanity_score': 0, 'novelty_score': 0, 'curiosity_score': 0,
            'emotion_score': 0, 'specificity_score': 0, 'composite_score': 0,
            'reject_reason': f"Banned phrase(s): {', '.join(banned_found)}",
            'banned_phrases_found': banned_found,
            'word_count': len(words), 'sentence_count': len(sentences)
        }
        
    hum_score = calculate_humanity(text, words, sentences)
    nov_score = calculate_novelty(text, words, sentences)
    cur_score = calculate_curiosity(text, words, sentences)
    emo_score = calculate_emotion(text, words, sentences)
    spc_score = calculate_specificity(text, words, sentences)
    
    composite = (hum_score + nov_score + cur_score + emo_score + spc_score) / 5.0
    
    status = 'PASS'
    reason = None
    if hum_score < 70:
        status = 'REJECTED'
        reason = f"humanity_score={hum_score} < 70"
        
    return {
        'status': status,
        'humanity_score': hum_score,
        'novelty_score': nov_score,
        'curiosity_score': cur_score,
        'emotion_score': emo_score,
        'specificity_score': spc_score,
        'composite_score': round(composite, 2),
        'reject_reason': reason,
        'banned_phrases_found': banned_found,
        'word_count': len(words),
        'sentence_count': len(sentences)
    }

def run_selftest():
    scripts = [
        # AI-sounding (Bad)
        "In today's rapidly evolving world, AI is transforming how we leverage optimal synergies. Let me tell you something, it is seamless and innovative.",
        # Good Hinglish
        "Yaar, honestly I don't get why people are so obsessed with 9-to-5 jobs! What if you could literally make 10x more working from Goa? I'm not even kidding. Wait till you hear about this crazy new thing.",
        # Borderline
        "This is a video about technology. It can be useful for your daily life. I think many people use it. Maybe you should try it out soon."
    ]
    
    for i, script in enumerate(scripts):
        print(f"--- Test Script {i+1} ---")
        print(f"Text: {script}")
        res = analyze_script(script)
        print(json.dumps(res, indent=2))
        print()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CHATR Script Quality Validator")
    parser.add_argument('--text', type=str, help="Script text to analyze")
    parser.add_argument('--file', type=str, help="Path to script file to analyze")
    parser.add_argument('--self-test', action='store_true', help="Run self tests")
    
    args = parser.parse_args()
    
    if args.self_test:
        run_selftest()
    elif args.text:
        print(json.dumps(analyze_script(args.text), indent=2))
    elif args.file:
        with open(args.file, 'r', encoding='utf-8') as f:
            print(json.dumps(analyze_script(f.read()), indent=2))
    else:
        parser.print_help()
