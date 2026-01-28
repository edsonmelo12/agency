
import { Project, StudioImage, Ebook, Producer, ProductInfo, VslScript } from "../types";

const DB_NAME = "LandingBuilderDBv2";
const EXPERTS_STORE = "experts";
const PRODUCTS_STORE = "products";
const PROJECTS_STORE = "projects";
const IMAGES_STORE = "studio_images";
const EBOOKS_STORE = "ebooks";
const VSL_STORE = "vsl_scripts";
const DB_VERSION = 7;

let dbPromise: Promise<IDBDatabase> | null = null;

export const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (e) => {
      console.error("Erro crítico ao abrir IndexedDB:", e);
      reject("Não foi possível abrir o banco de dados local.");
    };

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      const stores = [EXPERTS_STORE, PRODUCTS_STORE, PROJECTS_STORE, IMAGES_STORE, EBOOKS_STORE, VSL_STORE];
      stores.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      });
    };
  });

  return dbPromise;
};

export const clearAllData = async (): Promise<void> => {
  const db = await openDB();
  const stores = [EXPERTS_STORE, PRODUCTS_STORE, PROJECTS_STORE, IMAGES_STORE, EBOOKS_STORE, VSL_STORE];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, "readwrite");
    stores.forEach(s => {
      try {
        tx.objectStore(s).clear();
      } catch (e) {
        console.warn(`Erro ao limpar store ${s}:`, e);
      }
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const performWrite = async (storeName: string, data: any): Promise<void> => {
  if (!data || !data.id) {
    console.error(`Tentativa de salvar dado sem ID no store ${storeName}:`, data);
    return;
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.onabort = () => reject(tx.error);
  });
};

const performDelete = async (storeName: string, id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const request = tx.objectStore(storeName).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// --- EXPERTS ---
export const saveExpert = (expert: Producer) => performWrite(EXPERTS_STORE, expert);
export const getAllExperts = async (): Promise<Producer[]> => {
  const db = await openDB();
  const req = db.transaction(EXPERTS_STORE, "readonly").objectStore(EXPERTS_STORE).getAll();
  return new Promise(r => req.onsuccess = () => r(req.result));
};
export const deleteExpert = (id: string) => performDelete(EXPERTS_STORE, id);

// --- PRODUCTS ---
export const saveProduct = (product: ProductInfo) => performWrite(PRODUCTS_STORE, product);
export const getProductsByExpert = async (expertId: string): Promise<ProductInfo[]> => {
  const db = await openDB();
  const req = db.transaction(PRODUCTS_STORE, "readonly").objectStore(PRODUCTS_STORE).getAll();
  return new Promise(r => req.onsuccess = () => {
    const all = req.result as ProductInfo[];
    r(all.filter(p => p.producerId === expertId));
  });
};
export const deleteProduct = (id: string) => performDelete(PRODUCTS_STORE, id);

// --- PROJECTS ---
export const saveProject = (project: Project) => performWrite(PROJECTS_STORE, project);
export const getProjectsByProduct = async (productId: string): Promise<Project[]> => {
  const db = await openDB();
  const req = db.transaction(PROJECTS_STORE, "readonly").objectStore(PROJECTS_STORE).getAll();
  return new Promise(r => req.onsuccess = () => {
    const all = req.result as Project[];
    r(all.filter(p => p.productId === productId));
  });
};
export const deleteProject = (id: string) => performDelete(PROJECTS_STORE, id);

// --- IMAGES ---
export const getAllStudioImages = async (): Promise<StudioImage[]> => {
  const db = await openDB();
  const req = db.transaction(IMAGES_STORE, "readonly").objectStore(IMAGES_STORE).getAll();
  return new Promise(r => req.onsuccess = () => r(req.result));
};
export const saveStudioImage = (image: StudioImage) => performWrite(IMAGES_STORE, image);
export const deleteStudioImage = (id: string) => performDelete(IMAGES_STORE, id);

// --- EBOOKS ---
export const saveEbook = (ebook: Ebook) => performWrite(EBOOKS_STORE, ebook);
export const getEbooksByProduct = async (productId: string): Promise<Ebook[]> => {
  const db = await openDB();
  const req = db.transaction(EBOOKS_STORE, "readonly").objectStore(EBOOKS_STORE).getAll();
  return new Promise(r => req.onsuccess = () => {
    const all = req.result as Ebook[];
    r(all.filter(e => e.productId === productId));
  });
};
export const deleteEbook = (id: string) => performDelete(EBOOKS_STORE, id);

// --- VSL SCRIPTS ---
export const saveVslScript = (script: VslScript) => performWrite(VSL_STORE, script);
export const getVslScriptsByProduct = async (productId: string): Promise<VslScript[]> => {
  const db = await openDB();
  const req = db.transaction(VSL_STORE, "readonly").objectStore(VSL_STORE).getAll();
  return new Promise(r => req.onsuccess = () => {
    const all = req.result as VslScript[];
    r(all.filter(s => s.productId === productId));
  });
};
export const deleteVslScript = (id: string) => performDelete(VSL_STORE, id);
