// src/context/SiteContentContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getAllSiteContent } from '../helpers/getProductData.helper';
import { SLIDES as DEFAULT_SLIDES, GALLERY_IMAGES as DEFAULT_GALLERY, VIDEOS } from '../config/cloudinary';

const SiteContentContext = createContext({});

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState({
    // Default values while loading
    home_slider: DEFAULT_SLIDES.map((slide) => ({
      desktop: slide.url,
      mobile: slide.url,
      alt: slide.alt,
    })),
    home_gallery: DEFAULT_GALLERY,
    about_section: {
      title: 'Elígenos',
      content: '',
      video: VIDEOS.promo,
    },
    footer: {
      address: 'Selin Alvarado 935, Caldera',
      addressUrl: 'https://maps.app.goo.gl/1Ej2EUwZqAXNQrc58',
      phone: '+56 9 9280 0156',
      phoneUrl: 'https://wa.me/56992800156',
      email: 'contacto@lapancomido.cl',
      instagram: '@lapancomido',
      instagramUrl: 'https://www.instagram.com/lapancomido/',
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    try {
      const data = await getAllSiteContent();
      if (data && Object.keys(data).length > 0) {
        setContent((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (error) {
      console.error('Error loading site content:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteContentContext.Provider value={{ content, loading }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
