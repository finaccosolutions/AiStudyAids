class SpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  
  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    // Initialize voices when they load (if they haven't loaded yet)
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
    }
  }
  
  private loadVoices() {
    this.voices = this.synth.getVoices();
  }
  
  speak(text: string, language: string = 'en-US') {
    // Cancel any ongoing speech
    this.synth.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find a voice that matches the language
    const matchedVoice = this.voices.find(voice => 
      voice.lang.startsWith(language.split('-')[0]) && !voice.localService
    );
    
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    
    utterance.lang = language;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    // Speak the text
    this.synth.speak(utterance);
  }
  
  stop() {
    this.synth.cancel();
  }
  
  isPaused() {
    return this.synth.paused;
  }
  
  pause() {
    this.synth.pause();
  }
  
  resume() {
    this.synth.resume();
  }
  
  isSpeaking() {
    return this.synth.speaking;
  }
}

export const speechService = new SpeechService();