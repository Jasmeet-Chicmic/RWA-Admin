"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import { ReactNode } from "react";
import { SwiperCardItem } from "./helpers/types";
import { useTranslations } from "next-intl";

export interface SwiperCardProps {
  title?: string;
  subtitle?: string;
  data: SwiperCardItem[];
  height?: number | string;
  autoSlide?: boolean;
  delay?: number;
  customHeader?: ReactNode;
}

const SwiperCard = ({
  title = "Analytics",
  subtitle = "Overview",
  data,
  height = 320,
  autoSlide = true,
  delay = 4000,
  customHeader,
}: SwiperCardProps) => {
  console.log("<><><><><><>", data);
  const t = useTranslations("common");
  return (
    <div className="rounded-[5px] overflow-hidden shadow-md relative bg-gradient-to-br from-indigo-500 to-purple-500 text-bgblack p-[24px] pb-[10px]">
      {/* Dots Pagination */}
      <div className="absolute !top-[22px] !right-[20px] !left-[unset] !w-fit h-fit z-10 swiper-pagination swiper-pagination-bullets !flex gap-2" />

      {/* Header */}
      {customHeader ?? (
        <div className="p-0">
          <h2 className="text-bgwhite text-title">{t(title)}</h2>
          <p className="!text-bgwhite text-content">{t(subtitle)}</p>
        </div>
      )}

      {/* Swiper */}
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        loop={true}
        autoplay={autoSlide ? { delay } : false}
        pagination={{ el: ".swiper-pagination", clickable: true }}
        className="w-full"
      >
        {data &&
          data.map((slide, index) => (
            <SwiperSlide key={`${slide?.title ? slide?.title + index : index}`}>
              <div
                className="flex items-end justify-between pr-[30px]"
                style={{ height }}
              >
                {/* Left: Textual Info */}
                <div className="flex flex-col gap-4 justify-end">
                  <h3 className="text-bgwhite text-subtitle">
                    {t(slide.title)}
                  </h3>
                  <div className="grid grid-cols-2 gap-[20px]">
                    {Object.entries(slide.details).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-[10px]">
                        <div className="bg-[rgba(0,0,0,0.2)] min-w-[40px] text-center text-bgwhite rounded-[5px] px-2 py-1 text-[0.875] font-semibold">
                          {value}
                        </div>
                        <span className="text-sm text-bgwhite truncate">
                          {t(key)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Illustration */}
                <div className="flex justify-center items-center relative">
                  <Image
                    src={slide.img}
                    alt={slide.title}
                    width={150}
                    height={150}
                    className="object-contain relative z-10"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};

export default SwiperCard;
