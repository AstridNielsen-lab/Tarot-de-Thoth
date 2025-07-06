import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { majorArcana } from '../../data/majorArcana';
import { courtCards } from '../../data/courtCards';
import { minorArcana } from '../../data/minorArcana';
import { getDetailedExplanation } from './ExplanationPage';

// Import card back image directly
import cardBack from '/public/cards/verso baralho.png';

// Use Vite's import.meta.glob to dynamically import all card images
import img1 from '/public/cards/1.png';
import img2 from '/public/cards/2.png';
import img3 from '/public/cards/3.png';
import img4 from '/public/cards/4.png';
import img5 from '/public/cards/5.png';
import img6 from '/public/cards/6.png';
import img7 from '/public/cards/7.png';
import img8 from '/public/cards/8.png';
import img9 from '/public/cards/9.png';
import img10 from '/public/cards/10.png';
import img11 from '/public/cards/11.png';
import img12 from '/public/cards/12.png';
import img13 from '/public/cards/13.png';
import img14 from '/public/cards/14.png';
import img15 from '/public/cards/15.png';
import img16 from '/public/cards/16.png';
import img17 from '/public/cards/17.png';
import img18 from '/public/cards/18.png';
import img19 from '/public/cards/19.png';
import img20 from '/public/cards/20.png';
import img21 from '/public/cards/21.png';
import img22 from '/public/cards/22.png';
import img23 from '/public/cards/23.png';
import img24 from '/public/cards/24.png';
import img25 from '/public/cards/25.png';
import img26 from '/public/cards/26.png';
import img27 from '/public/cards/27.png';
import img28 from '/public/cards/28.png';
import img29 from '/public/cards/29.png';
import img30 from '/public/cards/30.png';
import img31 from '/public/cards/31.png';
import img32 from '/public/cards/32.png';
import img33 from '/public/cards/33.png';
import img34 from '/public/cards/34.png';
import img35 from '/public/cards/35.png';
import img36 from '/public/cards/36.png';
import img37 from '/public/cards/37.png';
import img38 from '/public/cards/38.png';
import img39 from '/public/cards/39.png';
import img40 from '/public/cards/40.png';
import img41 from '/public/cards/41.png';
import img42 from '/public/cards/42.png';
import img43 from '/public/cards/43.png';
import img44 from '/public/cards/44.png';
import img45 from '/public/cards/45.png';
import img46 from '/public/cards/46.png';
import img47 from '/public/cards/47.png';
import img48 from '/public/cards/48.png';
import img49 from '/public/cards/49.png';
import img50 from '/public/cards/50.png';
import img51 from '/public/cards/51.png';
import img52 from '/public/cards/52.png';
import img53 from '/public/cards/53.png';
import img54 from '/public/cards/54.png';
import img55 from '/public/cards/55.png';
import img56 from '/public/cards/56.png';
import img57 from '/public/cards/57.png';
import img58 from '/public/cards/58.png';
import img59 from '/public/cards/59.png';
import img60 from '/public/cards/60.png';
import img61 from '/public/cards/61.png';
import img62 from '/public/cards/62.png';
import img63 from '/public/cards/63.png';
import img64 from '/public/cards/64.png';
import img65 from '/public/cards/65.png';
import img66 from '/public/cards/66.png';
import img67 from '/public/cards/67.png';
import img68 from '/public/cards/68.png';
import img69 from '/public/cards/69.png';
import img70 from '/public/cards/70.png';
import img71 from '/public/cards/71.png';
import img72 from '/public/cards/72.png';
import img73 from '/public/cards/73.png';
import img74 from '/public/cards/74.png';
import img75 from '/public/cards/75.png';
import img76 from '/public/cards/76.png';
import img77 from '/public/cards/77.png';
import img78 from '/public/cards/78.png';
// continue if there are more images or adjust accordingly

// Log for debugging
console.log('Card images loaded via static imports');

// Card ID to image number mapping
const cardImageMap: {[key: string]: string} = {
  // Major Arcana
  'fool': '1',
  'magus': '2',
  'priestess': '3',
  'empress': '4',
  'emperor': '5',
  'hierophant': '6',
  'lovers': '7',
  'chariot': '8',
  'adjustment': '9',
  'hermit': '10',
  'fortune': '11',
  'lust': '12',
  'hanged-man': '13',
  'death': '14',
  'art': '15',
  'devil': '16',
  'tower': '17',
  'star': '18',
  'moon': '19',
  'sun': '20',
  'aeon': '21',
  'universe': '22',
  
  // Court Cards - Wands
  'king-wands': '23',
  'queen-wands': '24',
  'prince-wands': '25',
  'princess-wands': '26',
  
  // Court Cards - Cups
  'knight-cups': '27',
  'queen-cups': '28',
  'prince-cups': '29',
  'princess-cups': '30',
  
  // Court Cards - Swords
  'king-swords': '31',
  'queen-swords': '32',
  'prince-swords': '33',
  'princess-swords': '34',
  
  // Court Cards - Disks
  'king-disks': '35',
  'queen-disks': '36',
  'prince-disks': '37',
  'princess-disks': '38',
  
  // Minor Arcana - Wands
  'ace-wands': '39',
  'two-wands': '40',
  'three-wands': '41',
  'four-wands': '42',
  'five-wands': '43',
  'six-wands': '44',
  'seven-wands': '45',
  'eight-wands': '46',
  'nine-wands': '47',
  'ten-wands': '48',
  
  // Minor Arcana - Cups
  'ace-cups': '49',
  'two-cups': '50',
  'three-cups': '51',
  'four-cups': '52',
  'five-cups': '53',
  'six-cups': '54',
  'seven-cups': '55',
  'eight-cups': '56',
  'nine-cups': '57',
  'ten-cups': '58',
  
  // Minor Arcana - Swords
  'ace-swords': '59',
  'two-swords': '60',
  'three-swords': '61',
  'four-swords': '62',
  'five-swords': '63',
  'six-swords': '64',
  'seven-swords': '65',
  'eight-swords': '66',
  'nine-swords': '67',
  'ten-swords': '68',
  
  // Minor Arcana - Disks
  'ace-disks': '69',
  'two-disks': '70',
  'three-disks': '71',
  'four-disks': '72',
  'five-disks': '73',
  'six-disks': '74',
  'seven-disks': '75',
  'eight-disks': '76',
  'nine-disks': '77',
  'ten-disks': '78'
};

// Add card back to the mapping
cardImageMap['card-back'] = 'verso baralho';

// Create an image map for direct access to imported image assets
const imageModuleMap: {[key: string]: string} = {
  '1': img1,
  '2': img2,
  '3': img3,
  '4': img4,
  '5': img5,
  '6': img6,
  '7': img7,
  '8': img8,
  '9': img9,
  '10': img10,
  '11': img11,
  '12': img12,
  '13': img13,
  '14': img14,
  '15': img15,
  '16': img16,
  '17': img17,
  '18': img18,
  '19': img19,
  '20': img20,
  '21': img21,
  '22': img22,
  '23': img23,
  '24': img24,
  '25': img25,
  '26': img26,
  '27': img27,
  '28': img28,
  '29': img29,
  '30': img30,
  '31': img31,
  '32': img32,
  '33': img33,
  '34': img34,
  '35': img35,
  '36': img36,
  '37': img37,
  '38': img38,
  '39': img39,
  '40': img40,
  '41': img41,
  '42': img42,
  '43': img43,
  '44': img44,
  '45': img45,
  '46': img46,
  '47': img47,
  '48': img48,
  '49': img49,
  '50': img50,
  '51': img51,
  '52': img52,
  '53': img53,
  '54': img54,
  '55': img55,
  '56': img56,
  '57': img57,
  '58': img58,
  '59': img59,
  '60': img60,
  '61': img61,
  '62': img62,
  '63': img63,
  '64': img64,
  '65': img65,
  '66': img66,
  '67': img67,
  '68': img68,
  '69': img69,
  '70': img70,
  '71': img71,
  '72': img72,
  '73': img73,
  '74': img74,
  '75': img75,
  '76': img76,
  '77': img77,
  '78': img78,
  'verso baralho': cardBack
};

// Create a cache for base64 encoded images
const base64Cache: {[key: string]: string} = {};

// Function to convert an image to base64
const convertImageToBase64 = async (imageUrl: string, imageId: string): Promise<string> => {
  try {
    // Check if we already have this image in cache
    if (base64Cache[imageId]) {
      console.log(`Using cached base64 for image: ${imageId}`);
      return base64Cache[imageId];
    }
    
    // Create a new image element to load the image
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Enable CORS
    
    // Create a promise that resolves when the image is loaded
    const imageLoadPromise = new Promise<string>((resolve, reject) => {
      img.onload = () => {
        try {
          // Create a canvas to draw the image and convert to base64
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0);
          
          // Convert to base64
          const base64 = canvas.toDataURL('image/png');
          
          // Cache the result
          base64Cache[imageId] = base64;
          
          resolve(base64);
        } catch (error) {
          console.error(`Error converting image to base64: ${imageId}`, error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error(`Error loading image for base64 conversion: ${imageId}`, error);
        reject(new Error(`Failed to load image: ${imageId}`));
      };
    });
    
    // Set the source to start loading
    img.src = imageUrl;
    
    // Wait for the image to load and convert
    return await imageLoadPromise;
  } catch (error) {
    console.error(`Error in convertImageToBase64 for ${imageId}:`, error);
    throw error;
  }
};

// Function to get the image for a card (either direct URL or base64)
const getCardImage = async (cardId: string): Promise<string> => {
  try {
    // Get the mapped image number for this card ID
    const imageNumber = cardImageMap[cardId];
    if (!imageNumber) {
      console.warn(`No image mapping found for card ID: ${cardId}, using card back image`);
      return await convertImageToBase64(cardBack, 'card-back');
    }
    
    // Special case for card back
    if (cardId === 'card-back') {
      return await convertImageToBase64(cardBack, 'card-back');
    }
    
    // Get the image from our module map
    const imageSource = imageModuleMap[imageNumber];
    if (!imageSource) {
      console.warn(`Image source not found for card ID: ${cardId} (${imageNumber}), using card back`);
      return await convertImageToBase64(cardBack, 'card-back');
    }
    
    // Convert the image to base64
    return await convertImageToBase64(imageSource, imageNumber);
  } catch (error) {
    // If anything goes wrong, return the card back image
    console.error(`Error getting image for card ${cardId}:`, error);
    return await convertImageToBase64(cardBack, 'card-back').catch(() => cardBack);
  }
};

// Loading message component for PDF generation
export const PDFLoadingMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="text-lg text-purple-200 mb-4">Gerando PDF...</div>
      <div className="w-full h-2 bg-purple-900 rounded-full">
        <div 
          className="h-full bg-amber-300 rounded-full animate-pulse"
          style={{ width: '100%' }}
        />
      </div>
      <div className="mt-4 text-sm text-purple-300">
        Isso pode levar alguns instantes. O PDF será aberto em uma nova janela quando estiver pronto.
      </div>
    </div>
  );
};

// Simple wrapper for the PDF images
const CardImageForPDF = ({ src, cardId }: { src: string, cardId: string }) => {
  return (
    <Image 
      style={styles.image} 
      src={src}
      cache
    />
  );
};

// Component for displaying a card image in the PDF
const CardImage = ({ cardId }: { cardId: string }) => {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(false);
        
        // Get the image (as base64 or URL)
        const imageSource = await getCardImage(cardId);
        
        if (isMounted) {
          setImageSource(imageSource);
          setIsLoading(false);
          console.log(`✅ Successfully loaded image for card: ${cardId}`);
        }
      } catch (err) {
        if (isMounted) {
          console.error(`❌ Error loading image for card ${cardId}:`, err);
          setError(true);
          setIsLoading(false);
        }
      }
    };
    
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [cardId]);
  
  // Error placeholder
  if (error || !imageSource) {
    return (
      <View style={[styles.image, { backgroundColor: '#4c1d95', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 10, color: '#e9d5ff', textAlign: 'center' }}>
          {isLoading ? 'Carregando imagem...' : 'Erro ao carregar imagem'}
        </Text>
        <Text style={{ fontSize: 8, color: '#e9d5ff', textAlign: 'center', marginTop: 5 }}>
          {cardImageMap[cardId] || cardId}
        </Text>
      </View>
    );
  }
  
  // Render the image
  return <CardImageForPDF src={imageSource} cardId={cardId} />;
};

const allCards = [...majorArcana, ...courtCards, ...minorArcana];


// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#1e1b4b', // Dark purple background similar to the website
    color: '#ffffff',
  },
  section: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(76, 29, 149, 0.5)', // Semi-transparent purple
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    color: '#fcd34d', // Yellow gold for headers
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: '#fcd34d', // Yellow gold for card titles
    fontWeight: 'bold',
  },
  cardContainer: {
    marginBottom: 30,
    borderBottom: '1px solid #6b21a8',
    paddingBottom: 15,
    display: 'flex',
    flexDirection: 'row',
  },
  imageContainer: {
    width: 140,
    marginRight: 15,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  image: {
    width: 120,
    height: 180,
    marginBottom: 10,
    border: '1px solid #8b5cf6',
    objectFit: 'contain',
    alignSelf: 'center',
    backgroundColor: '#4c1d95', // Add background color for better visibility
  },
  textContainer: {
    flex: 1,
  },
  smallText: {
    fontSize: 10,
    textAlign: 'justify',
    marginBottom: 10,
    color: '#e9d5ff', // Light purple for readability
    lineHeight: 1.5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a78bfa', // Brighter purple for section titles
    marginTop: 8,
    marginBottom: 4,
  },
  listItem: {
    marginBottom: 6,
    fontSize: 10,
    color: '#d8b4fe', // Light purple for keywords
  },
  tableOfContents: {
    marginBottom: 20,
    fontSize: 14,
    color: '#e9d5ff', // Light purple
  },
  coverPage: {
    marginBottom: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80%',
  },
  suitLabel: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#c4b5fd',
    textAlign: 'center',
  },
  coverImage: {
    width: 200,
    height: 320,
    alignSelf: 'center',
    marginBottom: 20,
  },
  coverTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fcd34d',
    textAlign: 'center',
    marginBottom: 15,
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#e9d5ff',
    textAlign: 'center',
    marginBottom: 30,
  },
});

// Create PDF Document Component
export const ThothBookPDF = () => {
  // State to track base64 image preloading
  const [imagesReady, setImagesReady] = useState<boolean>(false);
  const [preloadProgress, setPreloadProgress] = useState<number>(0);
  
  // Preload all images and convert them to base64
  useEffect(() => {
    const preloadAllImages = async () => {
      console.log('Starting to preload and convert all card images to base64...');
      
      try {
        const allCardIds = [...majorArcana, ...courtCards, ...minorArcana].map(card => card.id);
        allCardIds.push('card-back');
        
        let completed = 0;
        
        // Process images in smaller batches to avoid overwhelming the browser
        const batchSize = 5;
        for (let i = 0; i < allCardIds.length; i += batchSize) {
          const batch = allCardIds.slice(i, i + batchSize);
          
          // Process this batch in parallel
          await Promise.all(
            batch.map(async (cardId) => {
              try {
                await getCardImage(cardId);
                completed++;
                setPreloadProgress(Math.floor((completed / allCardIds.length) * 100));
              } catch (error) {
                console.error(`Failed to preload image for card: ${cardId}`, error);
              }
            })
          );
        }
        
        console.log('✅ All images preloaded and converted to base64');
        setImagesReady(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        // Even if there are errors, we'll continue with PDF generation
        setImagesReady(true);
      }
    };
    
    preloadAllImages();
  }, []);
  
  // Directly render the PDF document with images
  return (
    <Document>
    {/* Cover Page */}
    <Page style={styles.page}>
      <View style={styles.coverPage}>
        <CardImage cardId="card-back" />
        <Text style={styles.coverTitle}>O Livro de Thoth</Text>
        <Text style={styles.coverSubtitle}>Interpretação Detalhada das Cartas</Text>
        <Text style={styles.smallText}>Explore os 78 arcanos conforme apresentados por Aleister Crowley em seu Livro de Thoth, incorporando os princípios do sistema thelêmico.</Text>
      </View>

      {/* Table of Contents */}
      <View style={styles.section}>
        <Text style={styles.header}>Sumário</Text>
        <Text style={styles.tableOfContents}>- Arcanos Maiores</Text>
        <Text style={styles.tableOfContents}>- Cartas da Corte</Text>
        <Text style={styles.tableOfContents}>- Arcanos Menores</Text>
      </View>
    </Page>
    
    {/* Major Arcana Section */}
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Arcanos Maiores</Text>
        {majorArcana.map(card => {
          const { thothExplanation, symbology, qabalistic, astrological } = getDetailedExplanation(card);
          return (
            <View key={card.id} style={styles.cardContainer} wrap={false}>
              <View style={styles.imageContainer}>
                <Text style={styles.cardTitle}>{`${card.name}`}</Text>
                <Text style={[styles.smallText, { marginBottom: 5 }]}>{card.englishName}</Text>
                <CardImage cardId={card.id} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.smallText}>{thothExplanation}</Text>
                <Text style={styles.sectionTitle}>Simbologia</Text>
                <Text style={styles.smallText}>{symbology}</Text>
                <Text style={styles.sectionTitle}>Correspondências Cabalísticas</Text>
                <Text style={styles.smallText}>{qabalistic}</Text>
                <Text style={styles.sectionTitle}>Correspondências Astrológicas</Text>
                <Text style={styles.smallText}>{astrological}</Text>
                <Text style={styles.listItem}>Palavras-chave: {card.keywords.join(', ')}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Page>

    {/* Court Cards Section */}
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Cartas da Corte</Text>
        {courtCards.map(card => {
          const { thothExplanation, symbology, qabalistic, astrological } = getDetailedExplanation(card);
          return (
            <View key={card.id} style={styles.cardContainer} wrap={false}>
              <View style={styles.imageContainer}>
                <Text style={styles.cardTitle}>{`${card.name}`}</Text>
                <Text style={[styles.smallText, { marginBottom: 5 }]}>{card.englishName}</Text>
                <CardImage cardId={card.id} />
                {card.suit && (
                  <Text style={styles.suitLabel}>{card.suit}</Text>
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.smallText}>{thothExplanation}</Text>
                <Text style={styles.sectionTitle}>Simbologia</Text>
                <Text style={styles.smallText}>{symbology}</Text>
                <Text style={styles.sectionTitle}>Correspondências Cabalísticas</Text>
                <Text style={styles.smallText}>{qabalistic}</Text>
                <Text style={styles.sectionTitle}>Correspondências Astrológicas</Text>
                <Text style={styles.smallText}>{astrological}</Text>
                <Text style={styles.listItem}>Palavras-chave: {card.keywords.join(', ')}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Page>

    {/* Minor Arcana Section */}
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Arcanos Menores</Text>
        {minorArcana.map(card => {
          const { thothExplanation, symbology, qabalistic, astrological } = getDetailedExplanation(card);
          return (
            <View key={card.id} style={styles.cardContainer} wrap={false}>
              <View style={styles.imageContainer}>
                <Text style={styles.cardTitle}>{`${card.name}`}</Text>
                <Text style={[styles.smallText, { marginBottom: 5 }]}>{card.englishName}</Text>
                <CardImage cardId={card.id} />
                {card.suit && (
                  <Text style={styles.suitLabel}>{card.suit}</Text>
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.smallText}>{thothExplanation}</Text>
                <Text style={styles.sectionTitle}>Simbologia</Text>
                <Text style={styles.smallText}>{symbology}</Text>
                <Text style={styles.sectionTitle}>Correspondências Cabalísticas</Text>
                <Text style={styles.smallText}>{qabalistic}</Text>
                <Text style={styles.sectionTitle}>Correspondências Astrológicas</Text>
                <Text style={styles.smallText}>{astrological}</Text>
                <Text style={styles.listItem}>Palavras-chave: {card.keywords.join(', ')}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Page>
  </Document>
  );
};
// Wrapper component for showing the PDF with a loading message
export const ThothBookPDFWithImages = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [preloadStarted, setPreloadStarted] = useState(false);
  
  // Start preloading after a short delay to allow the loading UI to render
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreloadStarted(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Custom loading message with progress for base64 conversion
  const PDFPreloadingMessage = ({ progress }: { progress: number }) => {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-lg text-purple-200 mb-4">Preparando imagens para o PDF...</div>
        <div className="w-full h-2 bg-purple-900 rounded-full">
          <div 
            className="h-full bg-amber-300 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-purple-200">
          {progress}% completo
        </div>
        <div className="mt-4 text-sm text-purple-300">
          Estamos convertendo todas as imagens para garantir que o PDF seja gerado corretamente.
        </div>
      </div>
    );
  };
  
  // Initial loading indicator
  if (!preloadStarted) {
    return <PDFLoadingMessage />;
  }
  
  // Show preloading progress
  return <ThothBookPDF />;
};

// Helper function to verify image conversion to base64
export const testBase64Conversion = async () => {
  // Test a few images to verify base64 conversion
  const testCardIds = [
    'fool',
    'magus',
    'universe',
    'ace-wands',
    'king-wands',
    'card-back'
  ];
  
  console.log('Testing base64 conversion for sample images:');
  
  for (const cardId of testCardIds) {
    try {
      const base64Image = await getCardImage(cardId);
      const imageNumber = cardImageMap[cardId];
      const isBased64 = base64Image.startsWith('data:image');
      console.log(`✅ Base64 conversion for card: ${cardId} (${imageNumber}) - ${isBased64 ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error(`❌ Failed to convert image for card: ${cardId}`, error);
    }
  }
};

// Debug function to check the cache status
export const checkBase64Cache = () => {
  console.log('Base64 cache status:');
  console.log(`Total cached images: ${Object.keys(base64Cache).length}`);
  
  // Log a few sample entries if they exist
  const cacheKeys = Object.keys(base64Cache);
  if (cacheKeys.length > 0) {
    console.log('Sample cache entries:');
    cacheKeys.slice(0, 3).forEach(key => {
      const value = base64Cache[key];
      console.log(`- ${key}: ${value ? value.substring(0, 50) + '...' : 'undefined'}`);
    });
  }
};
