 function access < TElement = HTMLElement, Return = any > (elems: LikeArray < TElement > , callback: (elem: TElement, index: number) => void, modeReturn: Return): Return;

 function access < TElement = HTMLElement, Return = any > (elems: LikeArray < TElement > , callback: (elem: TElement, index: number) => Return, modeReturn: true, reduce: boolean): Return;

 function access < TElement = HTMLElement, Return = any > (elems: LikeArray < TElement > , callback: (elem: TElement, index: number) => Return, modeReturn: true | any, reduce = false): Return {
   if (modeReturn === true) {
     let result;
     each(elems, (i, elem) => {
       const r = callback(elem, i)

       if (result === void 0) {
         result = r
       }

       if (reduce === false) {
         return false
       }

       result += r
     })

     return result
   } else {
     each(elems, (i, elem) => {
       callback(elem, i)
     })

     return modeReturn
   }
 }

 export default access