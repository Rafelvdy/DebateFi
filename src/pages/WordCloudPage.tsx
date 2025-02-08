import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import './WordCloudPage.css';

interface Debate {
  id: number;
  description: string;
  importance: string;
  arguments: {
    sideA: string;
    sideB: string;
  };
  consensus: number;
}

interface WordCloudProps {
  debates: Debate[];
  sortBy: 'dateDesc' | 'dateAsc' | 'sentiment';
  sentimentRange: number;
}

interface Word {
  text: string;
  size: number;
  sentiment: number;
}

interface PlacedWord extends Word {
  x: number;
  y: number;
}

const WordCloudPage: React.FC<WordCloudProps> = ({ debates, sortBy, sentimentRange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const words = useMemo(() => {
    let filteredDebates = [...debates];
    
    if (sortBy === 'sentiment') {
      filteredDebates = filteredDebates
        .sort((a, b) => b.consensus - a.consensus);
      
      if (sentimentRange > 0) {
        filteredDebates = filteredDebates
          .filter(debate => debate.consensus * 100 <= sentimentRange);
      }
    }
    
    return filteredDebates.map(debate => ({
      text: debate.description,
      size: 14 + (debate.consensus * 20),
      sentiment: debate.consensus
    })) as Word[];
  }, [debates, sortBy, sentimentRange]);

  // Set up resize observer
  useEffect(() => {
    if (!svgRef.current?.parentElement) return;

    const container = svgRef.current.parentElement;
    setDimensions({
      width: container.clientWidth,
      height: container.clientHeight
    });

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Memoize the word placement calculations
  const placedWords = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return [];

    const result: PlacedWord[] = [];
    const padding = 20;

    const seededRandom = (seed: string) => {
      const hash = seed.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
      return (hash % 100000) / 100000;
    };

    words.forEach(word => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 3000;

      const hashCode = word.text.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
      const isVertical = hashCode % 2 === 0;
      const wordWidth = isVertical ? word.size : word.text.length * (word.size * 0.5);
      const wordHeight = isVertical ? word.text.length * (word.size * 0.5) : word.size;

      while (!placed && attempts < maxAttempts) {
        const seed = `${word.text}-${attempts}`;
        const angle = seededRandom(seed) * Math.PI * 2;
        const radius = Math.sqrt(attempts) * 10;
        
        const jitter = (seededRandom(`jitter-${word.text}`) * 20) - 10;
        const x = Math.cos(angle) * radius + jitter;
        const y = Math.sin(angle) * radius + jitter;
        
        const isWithinBounds = 
          Math.abs(x) + (wordWidth / 2) < (dimensions.width / 2) &&
          Math.abs(y) + (wordHeight / 2) < (dimensions.height / 2);
        
        let hasCollision = result.some(placed => {
          const placedHashCode = placed.text.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
          const isPlacedVertical = placedHashCode % 2 === 0;
          
          const placedWidth = isPlacedVertical ? placed.size : placed.text.length * (placed.size * 0.5);
          const placedHeight = isPlacedVertical ? placed.text.length * (placed.size * 0.5) : placed.size;
          
          const dx = Math.abs(placed.x - x);
          const dy = Math.abs(placed.y - y);
          
          return (dx < (wordWidth + placedWidth) / 2 + padding) && 
                 (dy < (wordHeight + placedHeight) / 2 + padding);
        });

        if (!hasCollision && isWithinBounds) {
          result.push({ ...word, x, y });
          placed = true;
        }

        attempts++;
      }
    });

    return result;
  }, [words, dimensions]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Clear previous content
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${dimensions.width/2},${dimensions.height/2})`);

    // Render all words
    g.selectAll("text")
      .data(placedWords)
      .enter().append("text")
      .style("font-size", d => `${d.size}px`)
      .style("font-family", "Arial")
      .style("fill", d => d3.interpolateBlues(d.sentiment))
      .attr("text-anchor", "middle")
      .attr("transform", d => {
        const hashCode = d.text.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        const rotation = hashCode % 2 === 0 ? 90 : 0;
        return `translate(${d.x},${d.y}) rotate(${rotation})`;
      })
      .text(d => d.text)
      .append("title")
      .text(d => `${d.text}\nConsensus: ${Math.round(d.sentiment * 100)}%`);

  }, [placedWords, dimensions]);

  return (
    <div className="wordcloud-container">
      <div className="wordcloud-card">
        <h2 className="wordcloud-title">Debate Consensus Cloud</h2>
        <div className="wordcloud">
          <svg ref={svgRef}></svg>
        </div>
      </div>
    </div>
  );
};

export default WordCloudPage;
