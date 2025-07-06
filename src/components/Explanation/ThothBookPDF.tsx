import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { majorArcana } from '../../data/majorArcana';
import { courtCards } from '../../data/courtCards';
import { minorArcana } from '../../data/minorArcana';
import { getDetailedExplanation } from './ExplanationPage';

// The base URL for your deployed application
const BASE_URL = 'https://tarot-de-thoth.vercel.app';

// Default fallback image for cards that fail to load
const FALLBACK_IMAGE = `${BASE_URL}/assets/verso-baralho.jpg`;

// Function to get the correct image URL for a card
const getCardImageUrl = (cardId: string) => {
  return `${BASE_URL}/cards/${cardId}.png`;
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
    width: 120,
    marginRight: 15,
  },
  image: {
    width: 100,
    height: 160,
    objectFit: 'contain',
    marginBottom: 10,
    border: '1px solid #8b5cf6',
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

// Create Document Component
export const ThothBookPDF = () => (
  <Document>
    {/* Cover Page */}
    <Page style={styles.page}>
      <View style={styles.coverPage}>
        <Image 
          style={styles.coverImage} 
          src={`${BASE_URL}/assets/verso-baralho.jpg`}
          cache={false}
        />
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
                <Image 
                  style={styles.image} 
                  src={getCardImageUrl(card.id)} 
                  cache={false}
                />
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
                <Image 
                  style={styles.image} 
                  src={getCardImageUrl(card.id)} 
                  cache={false}
                />
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
                <Image 
                  style={styles.image} 
                  src={getCardImageUrl(card.id)} 
                  cache={false}
                />
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
