function semitonesAway(fun, semitones)
{
  return fun * Math.pow(2, (semitones/12));
}
 
 
function sin(freq, amp, t)
{
  return amp * Math.sin(2 * Math.PI * t * freq);
}

function harmonics(fun, harm, t)
{
  let wave = 0;
  for(let i = 0; i < harm.length; i++)
  {
    wave += (harm[i] * Math.sin(2 * Math.PI * t * fun * (i+1)));
  }
  return wave;
}

function dsp(t) 
{
  
  let qbeat = Math.floor(t * 4);
  let beat = Math.floor(t);
  

  let organ = [1, 0.95, 0, 1, 0, 
              0.5, 0, 0, 0, 0,
              0, 0, 0, 0, 0,
              0, 0, 0, 0, 0,
              0, 0, 0, 0, 0,
              0, 0, 0, 0, 0,
              0, 0];

  let bells = [1, 0, 0, 0, 0, 
              0, 0, 0, 0, 0.9,
              0, 0, 0, 0, 0,
              0, 0, 0, 0, 0.2,
              0, 0, 0, 0, 0,
              0, 0, 0, 0, 0.1,
              0, 0];
  
  
  let seq = [0, 4, 7, 11, 0, 4, 7, 11, 1, 4, 7, 11, 1, 4, 7, 11, 
            2, 5, 9, 12, 2, 5, 9, 12,  2, 5, 8, 12, 2, 5, 8, 14];
            
  let bassseq = [0, 7, 1, 7, 2, 9, 2, 8];
            
  let noteA = seq[qbeat % seq.length];
  let noteB = bassseq[beat % bassseq.length];
  
  let organNotes = 0.1 * harmonics(semitonesAway(220, noteA), organ, t);
  let bellNotes = 0.2 * harmonics(semitonesAway(110, noteB), organ, t);

  return organNotes + bellNotes;
}