export const FAMILY_QUESTIONS = [
  { id:"forbrug", title:"Valg 1: Forbrugsvaner", prompt:"I er en familie som…", options:[
    { key:"A", label:"A", text:"tænker meget over jeres forbrug og køber kun det nødvendige.", tag:"Sparsomme" },
    { key:"B", label:"B", text:"har et normalt forbrug og køber det, I har brug for.", tag:"Balancerede" },
    { key:"C", label:"C", text:"køber ofte spontant og forkæler jer selv.", tag:"Impulsive" },
  ] },
  { id:"mad", title:"Valg 2: Mad og hverdag", prompt:"Når det gælder mad, er I en familie som…", options:[
    { key:"A", label:"A", text:"laver mad fra bunden og planlægger ugens indkøb.", tag:"Planlæggere" },
    { key:"B", label:"B", text:"både laver mad og vælger nemme løsninger indimellem.", tag:"Praktiske" },
    { key:"C", label:"C", text:"ofte køber takeaway eller meget nemme løsninger.", tag:"Travle" },
  ] },
  { id:"prioritet", title:"Valg 3: Prioriteter", prompt:"I prioriterer især…", options:[
    { key:"A", label:"A", text:"opsparing og økonomisk tryghed.", tag:"Trygge" },
    { key:"B", label:"B", text:"balance mellem tryghed og oplevelser.", tag:"Realister" },
    { key:"C", label:"C", text:"oplevelser her og nu.", tag:"Oplevelsesfolk" },
  ] },
  { id:"fritid", title:"Valg 4: Fritid og aktiviteter", prompt:"I forhold til fritid og aktiviteter…", options:[
    { key:"A", label:"A", text:"har I få og billige aktiviteter.", tag:"Rolige" },
    { key:"B", label:"B", text:"har I nogle faste aktiviteter.", tag:"Aktive" },
    { key:"C", label:"C", text:"har I mange (og ofte dyre) aktiviteter.", tag:"Meget aktive" },
  ] },
  { id:"abonnementer", title:"Valg 5: Teknologi og abonnementer", prompt:"I er en familie som…", options:[
    { key:"A", label:"A", text:"har få abonnementer og deler tjenester.", tag:"Minimalister" },
    { key:"B", label:"B", text:"har de mest almindelige abonnementer.", tag:"Standard" },
    { key:"C", label:"C", text:"har mange streaming-, spil- og tech-abonnementer.", tag:"Tech-glade" },
  ] },
  { id:"plan", title:"Valg 6: Planlægning", prompt:"Når det gælder økonomi, er I…", options:[
    { key:"A", label:"A", text:"meget planlæggende og har godt overblik.", tag:"Strukturerede" },
    { key:"B", label:"B", text:"rimeligt organiserede det meste af tiden.", tag:"Fornuftige" },
    { key:"C", label:"C", text:"ofte lidt uorganiserede og tager tingene som de kommer.", tag:"Spontane" },
  ] },
];

export const OPTION_SCORES = { A:0.20, B:0.50, C:0.85 };
