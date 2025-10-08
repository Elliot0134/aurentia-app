import React from 'react';
import { Play, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { AITool } from '@/types/aiTools';

interface DescriptionTabProps {
  tool: AITool;
}

export const DescriptionTab: React.FC<DescriptionTabProps> = ({ tool }) => {
  return (
    <div className="space-y-8">
      {/* Vidéo si disponible */}
      {tool.video_url && (
        <Card>
          <CardContent className="p-6">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Vidéo de démonstration</p>
                <a 
                  href={tool.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 text-sm underline"
                >
                  Voir la vidéo
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {tool.tags.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tool.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Fonctionnalités */}
      {tool.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Fonctionnalités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tool.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Ce que vous obtenez */}
      {tool.what_you_get.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Ce que vous obtenez
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tool.what_you_get.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Comment utiliser cet outil */}
      {tool.how_to_use_steps.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="how-to-use">
            <AccordionTrigger className="text-lg font-semibold">
              Comment utiliser cet outil
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-6">
                {tool.how_to_use_steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold">
                        {step.step}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Description détaillée */}
      {tool.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description détaillée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {tool.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};