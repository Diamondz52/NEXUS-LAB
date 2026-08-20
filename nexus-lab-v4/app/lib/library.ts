export type LibraryType = "prompt"|"palette"|"gradient"|"neon"|"glass"|"motion"|"chaos";
export interface LibraryItem { id:string; type:LibraryType; name:string; createdAt:string; updatedAt:string; favorite:boolean; data:unknown; }
const KEY="nexus-library-v2";
export const getLibrary=():LibraryItem[]=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]") as LibraryItem[]}catch{return[]}};
const write=(items:LibraryItem[])=>{localStorage.setItem(KEY,JSON.stringify(items.slice(0,100)));window.dispatchEvent(new CustomEvent("nexus-library"));};
export const saveLibraryItem=(type:LibraryType,name:string,data:unknown)=>{const now=new Date().toISOString();const item:LibraryItem={id:crypto.randomUUID(),type,name,createdAt:now,updatedAt:now,favorite:false,data};write([item,...getLibrary()]);return item};
export const updateLibraryItem=(id:string,patch:Partial<Pick<LibraryItem,"name"|"favorite"|"data">>)=>{const items=getLibrary().map(item=>item.id===id?{...item,...patch,updatedAt:new Date().toISOString()}:item);write(items)};
export const deleteLibraryItem=(id:string)=>write(getLibrary().filter(item=>item.id!==id));
export const duplicateLibraryItem=(id:string)=>{const source=getLibrary().find(item=>item.id===id);if(!source)return;saveLibraryItem(source.type,`${source.name} COPY`,source.data)};
export const restoreLibraryItem=(item:LibraryItem)=>write([item,...getLibrary().filter(current=>current.id!==item.id)]);
