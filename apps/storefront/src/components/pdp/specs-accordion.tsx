import type { Route } from "next";
import Link from "next/link";

import { RichText } from "@/components/atoms/rich-text";
import { Badge, Button } from "@/components/ui";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { asPortableText } from "@/components/page-builder/utils";
import type { StoreProduct } from "@/medusa/types";
import type { EditorialProduct } from "@/lib/sanity/products";

export type SpecsAccordionProps = {
  editorial: EditorialProduct;
  product: StoreProduct;
};

function hasPortableText(value: unknown[] | null | undefined): boolean {
  return Array.isArray(value) && value.length > 0;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function MaterialsSection({ editorial, product }: SpecsAccordionProps) {
  const materials = editorial?.materials ?? [];
  const productMaterial = product.material?.trim();
  const productOrigin = product.origin_country?.trim();

  if (materials.length === 0 && !productMaterial && !productOrigin) {
    return <p>Material details are being prepared by the studio.</p>;
  }

  return (
    <div className="grid gap-5">
      {materials.length > 0 ? (
        <ul className="grid gap-5" role="list">
          {materials.map((material) => {
            const name = material.name?.trim() || "Material";

            return (
              <li className="grid gap-2" key={material._id}>
                <h3 className="font-body text-sm font-medium tracking-[0.08em] text-on-light uppercase">
                  {name}
                </h3>
                {material.composition ? <p>{material.composition}</p> : null}
                {material.origin ? <p>Origin: {material.origin}</p> : null}
                <RichText value={asPortableText(material.description)} />
              </li>
            );
          })}
        </ul>
      ) : null}

      {productMaterial ? <p>Composition: {productMaterial}</p> : null}
      {productOrigin ? <p>Made from materials sourced in {productOrigin.toUpperCase()}.</p> : null}
      <Button asChild variant="underline">
        <Link href={"/materials" as Route}>View all materials</Link>
      </Button>
    </div>
  );
}

function CareSection({ editorial }: { editorial: EditorialProduct }) {
  const materials = editorial?.materials ?? [];
  const materialCare = materials.filter((material) => hasText(material.careInstructions));

  if (!hasPortableText(editorial?.careNotes) && materialCare.length === 0) {
    return <p>Care notes will be added before this piece ships.</p>;
  }

  return (
    <div className="grid gap-5">
      <RichText value={asPortableText(editorial?.careNotes)} />
      {materialCare.length > 0 ? (
        <ul className="grid gap-3" role="list">
          {materialCare.map((material) => (
            <li key={material._id}>
              <span className="font-medium text-on-light">{material.name}: </span>
              {material.careInstructions}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SizingSection({ editorial }: { editorial: EditorialProduct }) {
  const modelSpecs = editorial?.modelSpecs;
  const sizeGuide = editorial?.sizeGuide;
  const measurements = sizeGuide?.measurements ?? [];

  return (
    <div className="grid gap-5">
      {modelSpecs?.height || modelSpecs?.wearingSize || modelSpecs?.notes ? (
        <p>
          {modelSpecs.height ? `The model is ${modelSpecs.height}` : "The model"}
          {modelSpecs.wearingSize ? ` and wears a ${modelSpecs.wearingSize}` : null}.
          {modelSpecs.notes ? ` ${modelSpecs.notes}` : null}
        </p>
      ) : null}

      {sizeGuide?.description ? <p>{sizeGuide.description}</p> : null}

      {measurements.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <caption className="sr-only">{sizeGuide?.name ?? "Size guide"} measurements</caption>
            <thead className="border-b border-on-light/10 text-xs tracking-[0.14em] text-on-light/55 uppercase">
              <tr>
                <th className="py-3 pr-4 font-medium" scope="col">
                  Size
                </th>
                <th className="py-3 pr-4 font-medium" scope="col">
                  Bust
                </th>
                <th className="py-3 pr-4 font-medium" scope="col">
                  Waist
                </th>
                <th className="py-3 pr-4 font-medium" scope="col">
                  Hips
                </th>
                <th className="py-3 pr-4 font-medium" scope="col">
                  Length
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-light/10">
              {measurements.map((measurement) => (
                <tr key={measurement._key}>
                  <th className="py-3 pr-4 font-medium text-on-light" scope="row">
                    {measurement.size ?? "-"}
                  </th>
                  <td className="py-3 pr-4">{measurement.bust ?? "-"}</td>
                  <td className="py-3 pr-4">{measurement.waist ?? "-"}</td>
                  <td className="py-3 pr-4">{measurement.hips ?? "-"}</td>
                  <td className="py-3 pr-4">{measurement.length ?? measurement.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Choose your usual size. Full measurements are coming soon.</p>
      )}

      <RichText value={asPortableText(sizeGuide?.tipsRichText)} />
    </div>
  );
}

function SustainabilitySection({ editorial }: { editorial: EditorialProduct }) {
  const certifications = editorial?.certifications ?? [];

  if (
    !hasPortableText(editorial?.sustainabilityNotes) &&
    certifications.length === 0 &&
    !editorial?.madeIn
  ) {
    return <p>Sustainability details are being reviewed by the studio.</p>;
  }

  return (
    <div className="grid gap-5">
      {editorial?.madeIn ? <p>Made in {editorial.madeIn}.</p> : null}
      <RichText value={asPortableText(editorial?.sustainabilityNotes)} />
      {certifications.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Certifications">
          {certifications.map((certification) => (
            <Badge key={certification} size="sm">
              {certification}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ShippingReturnsSection() {
  return (
    <div className="grid gap-4">
      <p>
        Orders ship in 3-5 business days once inventory is confirmed. Tracking follows by email.
      </p>
      <p>Returns are accepted for eligible unworn pieces under the published policy.</p>
      <div className="flex flex-wrap gap-4">
        <Button asChild variant="underline">
          <Link href={"/shipping" as Route}>Shipping details</Link>
        </Button>
        <Button asChild variant="underline">
          <Link href={"/returns" as Route}>Return policy</Link>
        </Button>
      </div>
    </div>
  );
}

export function SpecsAccordion({ editorial, product }: SpecsAccordionProps) {
  return (
    <Accordion className="border-t border-on-light/10" type="multiple">
      <AccordionItem value="materials">
        <AccordionHeader>
          <AccordionTrigger>Materials</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <MaterialsSection editorial={editorial} product={product} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="care">
        <AccordionHeader>
          <AccordionTrigger>Care</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <CareSection editorial={editorial} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="sizing">
        <AccordionHeader>
          <AccordionTrigger>Sizing &amp; fit</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <SizingSection editorial={editorial} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="sustainability">
        <AccordionHeader>
          <AccordionTrigger>Sustainability</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <SustainabilitySection editorial={editorial} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="shipping-returns">
        <AccordionHeader>
          <AccordionTrigger>Shipping &amp; returns</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <ShippingReturnsSection />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
