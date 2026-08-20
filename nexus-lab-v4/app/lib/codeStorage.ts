import {CODE_STORAGE_KEY,emptyStore,normalizeStore,ProjectStore} from "./codeLab";

const DB_NAME="nexus-code-lab-v3";
const STORE_NAME="workspace";
const STORE_KEY="current";
export const CODE_INDEX_KEY="nexus-code-projects-index-v3";

const openDatabase=()=>new Promise<IDBDatabase>((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>request.result.createObjectStore(STORE_NAME);
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
});

const readDatabase=async()=>{
  const database=await openDatabase();
  return new Promise<ProjectStore|null>((resolve,reject)=>{
    const transaction=database.transaction(STORE_NAME,"readonly");
    const request=transaction.objectStore(STORE_NAME).get(STORE_KEY);
    request.onsuccess=()=>resolve(request.result?normalizeStore(request.result as ProjectStore):null);
    request.onerror=()=>reject(request.error);
    transaction.oncomplete=()=>database.close();
  });
};

const writeDatabase=async(store:ProjectStore)=>{
  const database=await openDatabase();
  await new Promise<void>((resolve,reject)=>{
    const transaction=database.transaction(STORE_NAME,"readwrite");
    transaction.objectStore(STORE_NAME).put(store,STORE_KEY);
    transaction.oncomplete=()=>resolve();
    transaction.onerror=()=>reject(transaction.error);
  });
  database.close();
};

const updateIndex=(store:ProjectStore)=>{
  const active=store.projects.find(project=>project.id===store.activeProjectId)||store.projects[0];
  localStorage.setItem(CODE_INDEX_KEY,JSON.stringify({activeProjectId:active?.id||null,projects:store.projects.map(({id,name,updatedAt,type})=>({id,name,updatedAt,type}))}));
};

export const loadProjectStoreAsync=async():Promise<ProjectStore>=>{
  try{
    const stored=await readDatabase();
    if(stored)return stored;
  }catch{/* IndexedDB can be unavailable in private or restricted contexts. */}
  try{
    const legacy=localStorage.getItem(CODE_STORAGE_KEY);
    const store=legacy?normalizeStore(JSON.parse(legacy) as ProjectStore):emptyStore();
    if(store.projects.length)await saveProjectStoreAsync(store);
    return store;
  }catch{return emptyStore()}
};

export const saveProjectStoreAsync=async(store:ProjectStore)=>{
  const normalized=normalizeStore(store);
  updateIndex(normalized);
  try{
    await writeDatabase(normalized);
    localStorage.removeItem(CODE_STORAGE_KEY);
  }catch{
    localStorage.setItem(CODE_STORAGE_KEY,JSON.stringify(normalized));
  }
};

export const clearProjectStorage=async()=>{
  localStorage.removeItem(CODE_STORAGE_KEY);
  localStorage.removeItem(CODE_INDEX_KEY);
  try{
    const database=await openDatabase();
    await new Promise<void>((resolve,reject)=>{
      const transaction=database.transaction(STORE_NAME,"readwrite");
      transaction.objectStore(STORE_NAME).clear();
      transaction.oncomplete=()=>resolve();
      transaction.onerror=()=>reject(transaction.error);
    });
    database.close();
  }catch{/* The fallback stores were already cleared. */}
};
