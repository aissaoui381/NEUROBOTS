'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { LeadCard } from './lead-card';
import { SkeletonCard } from '@/components/ui/skeleton';
import type { Lead, LeadStatus } from '@/lib/supabase/types';

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'var(--accent)' },
  { id: 'contacted', label: 'Contacted', color: '#F59E0B' },
  { id: 'quoted', label: 'Quoted', color: '#7C3AED' },
  { id: 'won', label: 'Won', color: 'var(--success)' },
  { id: 'lost', label: 'Lost', color: 'var(--orange)' },
];

interface LeadPipelineProps {
  leads: Lead[];
  loading?: boolean;
  onStatusChange?: (leadId: string, status: LeadStatus) => void;
  onLeadClick?: (lead: Lead) => void;
}

export function LeadPipeline({ leads, loading, onStatusChange, onLeadClick }: LeadPipelineProps) {
  const [columns, setColumns] = useState<Record<LeadStatus, Lead[]>>({
    new: [], contacted: [], quoted: [], won: [], lost: [],
  });

  useEffect(() => {
    const grouped: Record<LeadStatus, Lead[]> = { new: [], contacted: [], quoted: [], won: [], lost: [] };
    for (const lead of leads) {
      grouped[lead.status].push(lead);
    }
    setColumns(grouped);
  }, [leads]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    const srcCol = source.droppableId as LeadStatus;
    const dstCol = destination.droppableId as LeadStatus;

    const src = Array.from(columns[srcCol]);
    const dst = srcCol === dstCol ? src : Array.from(columns[dstCol]);

    const [moved] = src.splice(source.index, 1);
    dst.splice(destination.index, 0, { ...moved, status: dstCol });

    setColumns(prev => ({
      ...prev,
      [srcCol]: src,
      [dstCol]: dst,
    }));

    onStatusChange?.(draggableId, dstCol);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-3">
        {COLUMNS.map(col => (
          <div key={col.id} className="space-y-2">
            <div className="skeleton h-4 w-20 mb-3" />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(180px, 1fr))` }}>
        {COLUMNS.map(col => (
          <div key={col.id} className="flex flex-col min-w-[180px]">
            <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: col.color }} />
                <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-[0.06em]">{col.label}</span>
              </div>
              <span className="text-xs font-mono text-[var(--muted)]">{columns[col.id].length}</span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-2 flex-1 min-h-[120px] rounded-[12px] p-2 transition-all duration-200"
                  style={{
                    background: snapshot.isDraggingOver ? `rgba(${col.color === 'var(--accent)' ? '14,165,255' : '255,255,255'},0.04)` : 'rgba(255,255,255,0.015)',
                    border: `1px dashed ${snapshot.isDraggingOver ? col.color : 'var(--border)'}`,
                  }}
                >
                  {columns[col.id].map((lead, i) => (
                    <Draggable key={lead.id} draggableId={lead.id} index={i}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                        >
                          <LeadCard
                            lead={lead}
                            isDragging={snap.isDragging}
                            onClick={() => onLeadClick?.(lead)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {columns[col.id].length === 0 && !snapshot.isDraggingOver && (
                    <div className="flex-1 flex items-center justify-center text-xs text-[var(--subtle)] py-6">
                      Drop leads here
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
