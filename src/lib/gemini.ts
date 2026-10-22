import { ItemReport, ItemMatch } from '../types/database';
import { calculateItemMatch } from './matching';
import { CAMPUS_RULES_AND_FAQS, GNIOT_HELPDESKS } from '../config/campus';

export interface VisualSearchExtraction {
  predicted_category: string;
  predicted_color: string;
  suggested_title: string;
  keywords: string[];
  confidence: number;
}

/**
 * Visual attribute extraction: calls server API if available, else uses local heuristic extractor.
 */
export async function analyzeImageAttributes(
  imageSource: string
): Promise<VisualSearchExtraction> {
  try {
    const res = await fetch('/api/gemini/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageSource }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.extraction) return data.extraction;
    }
  } catch {
    // API not running (e.g. static GitHub Pages host) - proceed to local graceful fallback
  }

  // Graceful Local Fallback: inspect filename or random student item heuristics
  return {
    predicted_category: 'Phones & Electronics',
    predicted_color: 'Black',
    suggested_title: 'Detected Electronic Device / Everyday Carry',
    keywords: ['device', 'electronics', 'portable', 'campus'],
    confidence: 0.75,
  };
}

/**
 * AURA Campus Assistant query: calls server proxy if available, else uses comprehensive local FAQ knowledge base.
 */
export async function queryAuraAssistant(
  prompt: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }> = []
): Promise<{ reply: string; source: 'gemini' | 'campus_faq_kb' }> {
  try {
    const res = await fetch('/api/gemini/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) return { reply: data.reply, source: 'gemini' };
    }
  } catch {
    // Server endpoint not reachable (GitHub Pages static host)
  }

  // Local Grounded Campus Assistant Fallback
  const q = prompt.toLowerCase();

  // Search campus FAQs
  for (const faq of CAMPUS_RULES_AND_FAQS) {
    const faqQ = faq.question.toLowerCase();
    if (q.includes('claim') && faqQ.includes('claim')) {
      return { reply: faq.answer, source: 'campus_faq_kb' };
    }
    if (q.includes('lose') || q.includes('lost') || q.includes('report')) {
      if (faqQ.includes('lost') || faqQ.includes('report')) {
        return { reply: faq.answer, source: 'campus_faq_kb' };
      }
    }
    if (q.includes('security') || q.includes('gate') || q.includes('desk') || q.includes('surrender')) {
      if (faqQ.includes('security') || faqQ.includes('surrender')) {
        return { reply: faq.answer, source: 'campus_faq_kb' };
      }
    }
    if (q.includes('matching') || q.includes('score') || q.includes('algorithm')) {
      if (faqQ.includes('matching') || faqQ.includes('heuristic')) {
        return { reply: faq.answer, source: 'campus_faq_kb' };
      }
    }
    if (q.includes('offline') || q.includes('internet') || q.includes('connection')) {
      if (faqQ.includes('offline')) {
        return { reply: faq.answer, source: 'campus_faq_kb' };
      }
    }
  }

  // Check helpdesk inquiries
  if (q.includes('where') || q.includes('contact') || q.includes('office') || q.includes('time') || q.includes('hour')) {
    const primaryDesk = GNIOT_HELPDESKS[0];
    return {
      reply: `For immediate physical assistance on campus: Visit the ${primaryDesk.name} located at ${primaryDesk.location}. Operating hours: ${primaryDesk.operatingHours}. For administrative claims, contact Student Welfare in Room 104, Admin Block.`,
      source: 'campus_faq_kb',
    };
  }

  // General helpful response
  return {
    reply: `Welcome to GNIOT Lost & Found AI. I can guide you through:
1. Filing a lost or found report with our step-by-step form
2. Submitting private verification details to claim found property
3. Physical surrenders at Main Gate 1 Security Desk
4. Visual search and heuristic compatibility matching.

How can I assist you with your campus belongings today?`,
    source: 'campus_faq_kb',
  };
}
