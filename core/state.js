import { MONTHS } from "../data/config.js";
export const STEPS = ["intro","family","jobs","distance","housing","unexpected","summary","adjust"];
export function defaultState(sessionId){
  return {
    version:"v4",
    sessionId,
    step:"intro",
    familyKey:null,
    family:null,
    jobs:null,
    distance:null,
    housing:null,
    unexpected:{ monthIndex:0, months: MONTHS.map(()=>({draws:[],locked:false})) },
    adjustments:{ familyKey:null, transportChoice:null, housingId:null }
  };
}
