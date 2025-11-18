function clamp(num, lower, upper) 
{
    return Math.min(Math.max(num, lower), upper);
}


//construct an instrument by giving the harmonics as an array of numbers, and the base pitch of the instrument
class Instrument
{
  constructor(harmonics, basePitch)
  {
    this.harmonics = harmonics;
    this.basePitch = basePitch;
  }
  
  //return a pure sine wave at time t with frequency pitch
  _playPureSin(pitch, t)
  {
    return Math.sin(2 * Math.PI * pitch * t);
  }
  
  //returns a pure sine wave, that is semitone semitones away from the fundamental frequency, at time t
  _playPureNote(fundamentalFreq, semitone, t)
  {
    return this._playPureSin(fundamentalFreq * Math.pow(2, semitone/12), t);
  }
  
  //return the wave semitones away from the base pitch at time t
  playNote(semitones, t)
  {
    let sum = 0;
    for(let i = 0; i < this.harmonics.length; i++)
    {
      sum += this.harmonics[i] * this._playPureNote(this.basePitch * (i+1), semitones, t);
    }
    return sum;
  }
  
  //takes a list of semitones from the base pitch, and a time t, and plays the resulting chord
  playChord(chord, t)
  {
    let sum = 0;
    for(let i = 0; i < chord.chordTones.length; i++)
    {
      sum += this.playNote(chord.chordTones[i], t);
    }
    return sum;
  }
}



class Chord
{
  constructor(tonality, transpose, inversion)
  {
    this.transpose = transpose;
    
    //set chord tonality
    switch(tonality)
    {
      case("maj"):
        this.chordTones = [transpose, transpose + 4, transpose + 7];
        break;
        
      case("maj7"):
        this.chordTones = [transpose, transpose + 4, transpose + 7, transpose + 11];
        break;
        
      case ("min"):
        this.chordTones = [transpose, transpose + 3, transpose + 7];
        break;
        
      case ("min7"):
        this.chordTones = [transpose, transpose + 3, transpose + 7, transpose + 10];
        break;
      
      case ("dom7"):
        this.chordTones = [transpose, transpose + 4, transpose + 7, transpose + 10];
        break;
    }
    
    //calculate inversion
    if(inversion >= 0)
    {
      for(let i = 0; i < inversion; i++)
      {
        this.chordTones[i % this.chordTones.length] += 12;
      }
    }
    else
    {
      for(let i = 0; i < Math.abs(inversion); i++)
      {
        this.chordTones[(this.chordTones.length - 1) - (i % this.chordTones.length)] -= 12;
      }
    }
  }
}


class Loop
{
  constructor(chords, timePerNote)
  {
    this.chords = chords;
    this.timePerNote = timePerNote;
  }
  
  _getNoteIndex(t)
  {
    return parseInt(1/this.timePerNote * t) % this.chords.length;
  }
  
  getNote(t)
  {
    return this.chords[this._getNoteIndex(t)];
  }
}


function dsp(t) 
{
  let cmaj7 = new Chord("maj7", 0, 0);
  let dm7 = new Chord("min7", 2, 0);
  let g7 = new Chord("dom7", 7, -2);
  let am7 = new Chord("min7", -3, 1);
  
  let noteLength = 2.0; //in seconds
  let swell = (t / noteLength) % 1;  //between 0 and 1, decimal component of time in note length
  let doubleSwell = (2*t / noteLength) % 1;  //between 0 and 1, decimal component of time in note length
  
  //loops
  let melodyLoop = new Loop([0, 2, 4, 7, -1, 0], noteLength / 2);
  let chordLoop = new Loop([dm7, g7, cmaj7, am7], noteLength);
  let bassLoop = new Loop([2, -5, 0, -3], noteLength);
  
  //instruments
  let melody = new Instrument([1.0, 0.5, 0.3, 0.2, 0.2, 0.1, 0.05, 0.05], 261.73);
  let pad = new Instrument([1.0, 0.5, 0.1], 261.73);
  let bass = new Instrument([1.0, 0.0, 0.1, 0.0, 0.1, 0.0, 0.05, 0.0, 0.01], 261.73/2)
  
  return clamp(swell, 0, 1) * (bass.playNote(bassLoop.getNote(t), t) + 0.5 * pad.playChord(chordLoop.getNote(t), t)) + clamp(doubleSwell, 0, 1) * melody.playNote(melodyLoop.getNote(t), t);
}
