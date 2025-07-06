import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import { majorArcana } from '../../data/majorArcana';
import { courtCards } from '../../data/courtCards';
import { minorArcana } from '../../data/minorArcana';
import { getDetailedExplanation } from './ExplanationPage';

// Combine all cards
const allCards = [...majorArcana, ...courtCards, ...minorArcana];

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 4
  },
  image: {
    width: '100px',
    height: '150px',
    marginBottom: 10,
  },
  smallText: {
    fontSize: 12,
    textAlign: 'justify',
    marginBottom: 10
  },
  listItem: {
    marginBottom: 6,
    fontSize: 12,
  },
  tableOfContents: {
    marginBottom: 20,
    fontSize: 14,
  },
  coverPage: {
    marginBottom: 40,
  }
});

// Create Document Component
export const ThothBookPDF = () => (
  <Document>
    {/* Cover Page */}
    <Page style={styles.page}>
      <View style={styles.coverPage}>
        <Text style={styles.header}>O Livro de Thoth - Interpretação Detalhada das Cartas</Text>
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
            <View key={card.id}>
              <Text style={styles.cardTitle}>{`${card.name} (${card.englishName})`}</Text>
              <Image style={styles.image} src={`/cards/${card.id}.png`} />
              <Text style={styles.smallText}>{thothExplanation}</Text>
              <Text style={styles.smallText}>{symbology}</Text>
              <Text style={styles.smallText}>{qabalistic}</Text>
              <Text style={styles.smallText}>{astrological}</Text>
              <Text style={styles.listItem}>Palavras-chave: {card.keywords.join(', ')}</Text>
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
            <View key={card.id}>
              <Text style={styles.cardTitle}>{`${card.name} (${card.englishName})`}</Text>
              <Image style={styles.image} src={`/cards/${card.id}.png`} />
              <Text style={styles.smallText}>{thothExplanation}</Text>
              <Text style={styles.smallText}>{symbology}</Text>
              <Text style={styles.smallText}>{qabalistic}</Text>
              <Text style={styles.smallText}>{astrological}</Text>
              <Text style={styles.listItem}>Palavras-chave: {card.keywords.join(', ')}</Text>
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
            <View key={card.id}>
              <Text style={styles.cardTitle}>{`${card.name} (${card.englishName})`}</Text>
              <Image style={styles.image} src={`/cards/${card.id}.png`} />
              <Text style={styles.smallText}>{thothExplanation}</Text>
              <Text style={styles.smallText}>{symbology}</Text>
              <Text style={styles.smallText}>{qabalistic}</Text>
              <Text style={styles.smallText}>{astrological}</Text>
              <Text style={styles.listItem}>Palavras-chave: {card.keywords.join(', ')}</Text>
            </View>
          );
        })}
      </View>
    </Page>
  </Document>
);
