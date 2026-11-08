import {useEffect} from 'react';
const set=(attr,key,val)=>{let el=document.head.querySelector(`meta[${attr}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el)}el.setAttribute('content',val)};
export default function useSeo(title,description,image){useEffect(()=>{const t=title?`${title} | Glass n Wood`:'Glass n Wood | Glasswork, Woodwork & Interiors in Siwan, Bihar';document.title=t;
set('name','description',description);set('property','og:title',t);set('property','og:description',description);if(image&&!image.startsWith('data:'))set('property','og:image',image)},[title,description,image])}
