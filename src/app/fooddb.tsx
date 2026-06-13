'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Search, Plus, Loader2, Globe, ScanLine } from 'lucide-react'
import dynamic from 'next/dynamic'

const BarcodeScanner = dynamic(() => import('./barcode-scanner'), { ssr: false })

type FoodItem = {
  name: string
  emoji: string
  cal100: number
  protein: number
  carbs: number
  fat: number
  portion: number
  category: string
  fromApi?: boolean
}

const CATEGORIES = [
  'Все', 'Супы', 'Вторые блюда', 'Гарниры', 'Завтраки',
  'Салаты', 'Выпечка', 'Десерты', 'Напитки',
  'Мясо и рыба', 'Овощи', 'Фрукты', 'Молочное', 'Злаки и орехи', 'Фастфуд',
  'Азиатская кухня', 'Итальянская кухня', 'Снеки', 'Соусы', 'Спортпит'
]

const FOODS: FoodItem[] = [
  // Супы
  { name: 'Борщ', emoji: '🍲', cal100: 50, protein: 3, carbs: 5, fat: 2, portion: 350, category: 'Супы' },
  { name: 'Щи', emoji: '🍲', cal100: 35, protein: 2, carbs: 4, fat: 1, portion: 350, category: 'Супы' },
  { name: 'Солянка', emoji: '🍲', cal100: 42, protein: 3, carbs: 3, fat: 2, portion: 300, category: 'Супы' },
  { name: 'Харчо', emoji: '🍲', cal100: 68, protein: 4, carbs: 6, fat: 3, portion: 300, category: 'Супы' },
  { name: 'Уха', emoji: '🍵', cal100: 45, protein: 5, carbs: 3, fat: 1, portion: 300, category: 'Супы' },
  { name: 'Рассольник', emoji: '🍲', cal100: 38, protein: 2, carbs: 4, fat: 1, portion: 300, category: 'Супы' },
  { name: 'Окрошка', emoji: '🥣', cal100: 40, protein: 3, carbs: 4, fat: 1, portion: 300, category: 'Супы' },
  { name: 'Гороховый суп', emoji: '🍵', cal100: 66, protein: 4, carbs: 8, fat: 2, portion: 300, category: 'Супы' },
  { name: 'Куриный суп с лапшой', emoji: '🍜', cal100: 55, protein: 4, carbs: 6, fat: 2, portion: 300, category: 'Супы' },
  { name: 'Суп с фрикадельками', emoji: '🍲', cal100: 60, protein: 4, carbs: 5, fat: 3, portion: 300, category: 'Супы' },
  { name: 'Томатный суп', emoji: '🍅', cal100: 32, protein: 1, carbs: 5, fat: 1, portion: 300, category: 'Супы' },
  { name: 'Суп-пюре из тыквы', emoji: '🎃', cal100: 45, protein: 1, carbs: 7, fat: 2, portion: 300, category: 'Супы' },

  // Вторые блюда
  { name: 'Пельмени', emoji: '🥟', cal100: 275, protein: 12, carbs: 28, fat: 13, portion: 200, category: 'Вторые блюда' },
  { name: 'Вареники с картошкой', emoji: '🥟', cal100: 210, protein: 6, carbs: 30, fat: 8, portion: 200, category: 'Вторые блюда' },
  { name: 'Вареники с творогом', emoji: '🥟', cal100: 220, protein: 10, carbs: 28, fat: 7, portion: 200, category: 'Вторые блюда' },
  { name: 'Манты', emoji: '🥟', cal100: 220, protein: 10, carbs: 22, fat: 10, portion: 200, category: 'Вторые блюда' },
  { name: 'Хинкали', emoji: '🥟', cal100: 185, protein: 10, carbs: 20, fat: 7, portion: 200, category: 'Вторые блюда' },
  { name: 'Голубцы', emoji: '🥬', cal100: 160, protein: 8, carbs: 12, fat: 8, portion: 200, category: 'Вторые блюда' },
  { name: 'Котлеты', emoji: '🍖', cal100: 248, protein: 14, carbs: 8, fat: 18, portion: 150, category: 'Вторые блюда' },
  { name: 'Бефстроганов', emoji: '🥩', cal100: 195, protein: 15, carbs: 6, fat: 13, portion: 200, category: 'Вторые блюда' },
  { name: 'Шашлык', emoji: '🍢', cal100: 220, protein: 18, carbs: 0, fat: 16, portion: 200, category: 'Вторые блюда' },
  { name: 'Плов', emoji: '🍚', cal100: 210, protein: 8, carbs: 25, fat: 9, portion: 300, category: 'Вторые блюда' },
  { name: 'Долма', emoji: '🫑', cal100: 155, protein: 7, carbs: 14, fat: 8, portion: 200, category: 'Вторые блюда' },
  { name: 'Блины с мясом', emoji: '🥞', cal100: 185, protein: 9, carbs: 18, fat: 8, portion: 200, category: 'Вторые блюда' },
  { name: 'Зразы', emoji: '🍖', cal100: 215, protein: 13, carbs: 12, fat: 12, portion: 150, category: 'Вторые блюда' },
  { name: 'Тефтели', emoji: '🍖', cal100: 195, protein: 12, carbs: 10, fat: 11, portion: 200, category: 'Вторые блюда' },
  { name: 'Жаркое', emoji: '🥘', cal100: 180, protein: 12, carbs: 10, fat: 10, portion: 250, category: 'Вторые блюда' },
  { name: 'Лазанья', emoji: '🍝', cal100: 165, protein: 9, carbs: 16, fat: 7, portion: 250, category: 'Вторые блюда' },

  // Гарниры
  { name: 'Гречка', emoji: '🌾', cal100: 132, protein: 5, carbs: 25, fat: 2, portion: 200, category: 'Гарниры' },
  { name: 'Рис варёный', emoji: '🍚', cal100: 116, protein: 2, carbs: 25, fat: 0, portion: 200, category: 'Гарниры' },
  { name: 'Картофельное пюре', emoji: '🥔', cal100: 90, protein: 2, carbs: 15, fat: 3, portion: 200, category: 'Гарниры' },
  { name: 'Картофель жареный', emoji: '🍟', cal100: 192, protein: 3, carbs: 26, fat: 9, portion: 200, category: 'Гарниры' },
  { name: 'Картофель варёный', emoji: '🥔', cal100: 80, protein: 2, carbs: 17, fat: 0, portion: 200, category: 'Гарниры' },
  { name: 'Макароны варёные', emoji: '🍝', cal100: 130, protein: 5, carbs: 26, fat: 1, portion: 200, category: 'Гарниры' },
  { name: 'Перловка', emoji: '🌾', cal100: 109, protein: 3, carbs: 22, fat: 0, portion: 200, category: 'Гарниры' },
  { name: 'Пшённая каша', emoji: '🌾', cal100: 90, protein: 3, carbs: 17, fat: 1, portion: 200, category: 'Гарниры' },
  { name: 'Булгур', emoji: '🌾', cal100: 120, protein: 4, carbs: 23, fat: 1, portion: 200, category: 'Гарниры' },
  { name: 'Чечевица варёная', emoji: '🫘', cal100: 111, protein: 9, carbs: 16, fat: 1, portion: 200, category: 'Гарниры' },
  { name: 'Фасоль варёная', emoji: '🫘', cal100: 123, protein: 8, carbs: 20, fat: 0, portion: 200, category: 'Гарниры' },

  // Завтраки
  { name: 'Овсянка на воде', emoji: '🥣', cal100: 88, protein: 3, carbs: 15, fat: 2, portion: 250, category: 'Завтраки' },
  { name: 'Овсянка на молоке', emoji: '🥣', cal100: 105, protein: 4, carbs: 15, fat: 3, portion: 250, category: 'Завтраки' },
  { name: 'Яичница (2 яйца)', emoji: '🍳', cal100: 190, protein: 13, carbs: 0, fat: 15, portion: 120, category: 'Завтраки' },
  { name: 'Омлет', emoji: '🍳', cal100: 185, protein: 12, carbs: 3, fat: 14, portion: 150, category: 'Завтраки' },
  { name: 'Яйцо варёное', emoji: '🥚', cal100: 155, protein: 13, carbs: 1, fat: 11, portion: 55, category: 'Завтраки' },
  { name: 'Творог 5%', emoji: '🥛', cal100: 121, protein: 17, carbs: 3, fat: 5, portion: 200, category: 'Завтраки' },
  { name: 'Творог 0%', emoji: '🥛', cal100: 71, protein: 16, carbs: 2, fat: 0, portion: 200, category: 'Завтраки' },
  { name: 'Сырники', emoji: '🧇', cal100: 220, protein: 14, carbs: 18, fat: 9, portion: 200, category: 'Завтраки' },
  { name: 'Блины', emoji: '🥞', cal100: 230, protein: 6, carbs: 32, fat: 9, portion: 150, category: 'Завтраки' },
  { name: 'Каша манная', emoji: '🥣', cal100: 80, protein: 3, carbs: 15, fat: 1, portion: 250, category: 'Завтраки' },
  { name: 'Гречневая каша с молоком', emoji: '🥣', cal100: 100, protein: 4, carbs: 18, fat: 2, portion: 250, category: 'Завтраки' },
  { name: 'Мюсли с молоком', emoji: '🥣', cal100: 170, protein: 5, carbs: 27, fat: 5, portion: 200, category: 'Завтраки' },
  { name: 'Тост с маслом', emoji: '🍞', cal100: 310, protein: 7, carbs: 38, fat: 15, portion: 50, category: 'Завтраки' },
  { name: 'Бутерброд с колбасой', emoji: '🥪', cal100: 245, protein: 9, carbs: 22, fat: 13, portion: 100, category: 'Завтраки' },
  { name: 'Бутерброд с сыром', emoji: '🥪', cal100: 280, protein: 12, carbs: 22, fat: 15, portion: 100, category: 'Завтраки' },

  // Салаты
  { name: 'Оливье', emoji: '🥗', cal100: 198, protein: 6, carbs: 10, fat: 15, portion: 200, category: 'Салаты' },
  { name: 'Селёдка под шубой', emoji: '🥗', cal100: 175, protein: 7, carbs: 8, fat: 13, portion: 200, category: 'Салаты' },
  { name: 'Греческий салат', emoji: '🥗', cal100: 95, protein: 4, carbs: 5, fat: 7, portion: 200, category: 'Салаты' },
  { name: 'Цезарь с курицей', emoji: '🥗', cal100: 130, protein: 9, carbs: 6, fat: 8, portion: 200, category: 'Салаты' },
  { name: 'Винегрет', emoji: '🥗', cal100: 80, protein: 2, carbs: 10, fat: 4, portion: 200, category: 'Салаты' },
  { name: 'Салат с тунцом', emoji: '🥗', cal100: 110, protein: 12, carbs: 4, fat: 5, portion: 200, category: 'Салаты' },
  { name: 'Мимоза', emoji: '🥗', cal100: 160, protein: 8, carbs: 5, fat: 12, portion: 200, category: 'Салаты' },
  { name: 'Салат из огурцов и помидоров', emoji: '🥗', cal100: 30, protein: 1, carbs: 4, fat: 1, portion: 200, category: 'Салаты' },

  // Выпечка
  { name: 'Хлеб белый', emoji: '🍞', cal100: 265, protein: 8, carbs: 50, fat: 3, portion: 30, category: 'Выпечка' },
  { name: 'Хлеб чёрный', emoji: '🍞', cal100: 210, protein: 6, carbs: 40, fat: 2, portion: 30, category: 'Выпечка' },
  { name: 'Хлеб бородинский', emoji: '🍞', cal100: 208, protein: 6, carbs: 40, fat: 2, portion: 30, category: 'Выпечка' },
  { name: 'Пирожок с капустой', emoji: '🥐', cal100: 235, protein: 6, carbs: 32, fat: 9, portion: 80, category: 'Выпечка' },
  { name: 'Пирожок с мясом', emoji: '🥐', cal100: 270, protein: 10, carbs: 28, fat: 14, portion: 80, category: 'Выпечка' },
  { name: 'Пирожок жареный с мясом', emoji: '🥐', cal100: 310, protein: 10, carbs: 28, fat: 18, portion: 90, category: 'Выпечка' },
  { name: 'Пирожок с яйцом и рисом', emoji: '🥐', cal100: 240, protein: 7, carbs: 30, fat: 10, portion: 80, category: 'Выпечка' },
  { name: 'Пирожок с яблоком', emoji: '🥐', cal100: 215, protein: 5, carbs: 34, fat: 7, portion: 80, category: 'Выпечка' },
  { name: 'Пирожок с картошкой', emoji: '🥐', cal100: 220, protein: 5, carbs: 32, fat: 8, portion: 80, category: 'Выпечка' },
  { name: 'Чебурек', emoji: '🥐', cal100: 280, protein: 10, carbs: 28, fat: 15, portion: 120, category: 'Выпечка' },
  { name: 'Самса', emoji: '🥐', cal100: 310, protein: 10, carbs: 30, fat: 17, portion: 120, category: 'Выпечка' },
  { name: 'Беляш', emoji: '🥐', cal100: 290, protein: 11, carbs: 28, fat: 16, portion: 120, category: 'Выпечка' },
  { name: 'Круассан', emoji: '🥐', cal100: 406, protein: 8, carbs: 45, fat: 21, portion: 60, category: 'Выпечка' },
  { name: 'Пончик', emoji: '🍩', cal100: 332, protein: 6, carbs: 45, fat: 15, portion: 70, category: 'Выпечка' },
  { name: 'Ватрушка', emoji: '🥐', cal100: 310, protein: 8, carbs: 48, fat: 10, portion: 100, category: 'Выпечка' },

  // Десерты
  { name: 'Торт Наполеон', emoji: '🎂', cal100: 400, protein: 5, carbs: 42, fat: 23, portion: 100, category: 'Десерты' },
  { name: 'Пастила', emoji: '🍬', cal100: 324, protein: 1, carbs: 80, fat: 0, portion: 50, category: 'Десерты' },
  { name: 'Халва', emoji: '🍯', cal100: 516, protein: 12, carbs: 54, fat: 30, portion: 50, category: 'Десерты' },
  { name: 'Мороженое пломбир', emoji: '🍦', cal100: 227, protein: 4, carbs: 21, fat: 14, portion: 100, category: 'Десерты' },
  { name: 'Зефир', emoji: '🍭', cal100: 326, protein: 1, carbs: 79, fat: 0, portion: 50, category: 'Десерты' },
  { name: 'Шоколад молочный', emoji: '🍫', cal100: 550, protein: 7, carbs: 57, fat: 32, portion: 25, category: 'Десерты' },
  { name: 'Шоколад тёмный', emoji: '🍫', cal100: 540, protein: 8, carbs: 46, fat: 34, portion: 25, category: 'Десерты' },
  { name: 'Пирог яблочный', emoji: '🥧', cal100: 250, protein: 4, carbs: 37, fat: 10, portion: 100, category: 'Десерты' },
  { name: 'Чизкейк', emoji: '🎂', cal100: 321, protein: 6, carbs: 26, fat: 21, portion: 100, category: 'Десерты' },
  { name: 'Медовик', emoji: '🎂', cal100: 380, protein: 5, carbs: 52, fat: 17, portion: 100, category: 'Десерты' },
  { name: 'Эклер', emoji: '🍮', cal100: 270, protein: 5, carbs: 30, fat: 15, portion: 80, category: 'Десерты' },

  // Напитки
  { name: 'Кефир 2.5%', emoji: '🥛', cal100: 53, protein: 3, carbs: 4, fat: 3, portion: 250, category: 'Напитки' },
  { name: 'Молоко 2.5%', emoji: '🥛', cal100: 52, protein: 3, carbs: 5, fat: 3, portion: 250, category: 'Напитки' },
  { name: 'Чай без сахара', emoji: '🍵', cal100: 1, protein: 0, carbs: 0, fat: 0, portion: 250, category: 'Напитки' },
  { name: 'Кофе чёрный', emoji: '☕', cal100: 2, protein: 0, carbs: 0, fat: 0, portion: 200, category: 'Напитки' },
  { name: 'Кофе с молоком', emoji: '☕', cal100: 40, protein: 2, carbs: 3, fat: 2, portion: 200, category: 'Напитки' },
  { name: 'Капучино', emoji: '☕', cal100: 60, protein: 3, carbs: 5, fat: 3, portion: 250, category: 'Напитки' },
  { name: 'Компот', emoji: '🍹', cal100: 60, protein: 0, carbs: 15, fat: 0, portion: 250, category: 'Напитки' },
  { name: 'Кисель', emoji: '🍹', cal100: 53, protein: 0, carbs: 13, fat: 0, portion: 250, category: 'Напитки' },
  { name: 'Апельсиновый сок', emoji: '🍊', cal100: 45, protein: 1, carbs: 10, fat: 0, portion: 200, category: 'Напитки' },
  { name: 'Яблочный сок', emoji: '🍎', cal100: 46, protein: 0, carbs: 11, fat: 0, portion: 200, category: 'Напитки' },
  { name: 'Ряженка', emoji: '🥛', cal100: 85, protein: 3, carbs: 5, fat: 5, portion: 250, category: 'Напитки' },
  { name: 'Йогурт питьевой', emoji: '🥛', cal100: 60, protein: 3, carbs: 8, fat: 2, portion: 250, category: 'Напитки' },
  { name: 'Какао', emoji: '🍫', cal100: 90, protein: 4, carbs: 11, fat: 3, portion: 200, category: 'Напитки' },
  { name: 'Квас', emoji: '🍺', cal100: 27, protein: 0, carbs: 6, fat: 0, portion: 250, category: 'Напитки' },

  // Мясо и рыба
  { name: 'Куриная грудка', emoji: '🍗', cal100: 113, protein: 24, carbs: 0, fat: 2, portion: 150, category: 'Мясо и рыба' },
  { name: 'Куриное бедро', emoji: '🍗', cal100: 185, protein: 18, carbs: 0, fat: 12, portion: 150, category: 'Мясо и рыба' },
  { name: 'Говядина варёная', emoji: '🥩', cal100: 254, protein: 25, carbs: 0, fat: 17, portion: 150, category: 'Мясо и рыба' },
  { name: 'Свинина жареная', emoji: '🥩', cal100: 330, protein: 20, carbs: 0, fat: 28, portion: 150, category: 'Мясо и рыба' },
  { name: 'Индейка', emoji: '🦃', cal100: 157, protein: 20, carbs: 0, fat: 8, portion: 150, category: 'Мясо и рыба' },
  { name: 'Лосось', emoji: '🐟', cal100: 208, protein: 20, carbs: 0, fat: 14, portion: 150, category: 'Мясо и рыба' },
  { name: 'Скумбрия', emoji: '🐟', cal100: 262, protein: 18, carbs: 0, fat: 21, portion: 150, category: 'Мясо и рыба' },
  { name: 'Треска', emoji: '🐟', cal100: 75, protein: 17, carbs: 0, fat: 1, portion: 150, category: 'Мясо и рыба' },
  { name: 'Тунец', emoji: '🐟', cal100: 130, protein: 28, carbs: 0, fat: 2, portion: 150, category: 'Мясо и рыба' },
  { name: 'Сельдь солёная', emoji: '🐟', cal100: 217, protein: 17, carbs: 0, fat: 17, portion: 100, category: 'Мясо и рыба' },
  { name: 'Сосиски', emoji: '🌭', cal100: 260, protein: 11, carbs: 2, fat: 23, portion: 100, category: 'Мясо и рыба' },
  { name: 'Варёная колбаса', emoji: '🥩', cal100: 260, protein: 12, carbs: 2, fat: 22, portion: 80, category: 'Мясо и рыба' },
  { name: 'Ветчина', emoji: '🥩', cal100: 210, protein: 17, carbs: 1, fat: 15, portion: 80, category: 'Мясо и рыба' },
  { name: 'Печень куриная', emoji: '🫀', cal100: 140, protein: 19, carbs: 1, fat: 6, portion: 150, category: 'Мясо и рыба' },
  { name: 'Яйцо куриное', emoji: '🥚', cal100: 157, protein: 13, carbs: 1, fat: 11, portion: 55, category: 'Мясо и рыба' },

  // Овощи
  { name: 'Огурец', emoji: '🥒', cal100: 15, protein: 1, carbs: 3, fat: 0, portion: 100, category: 'Овощи' },
  { name: 'Помидор', emoji: '🍅', cal100: 20, protein: 1, carbs: 4, fat: 0, portion: 100, category: 'Овощи' },
  { name: 'Капуста белокочанная', emoji: '🥬', cal100: 27, protein: 2, carbs: 5, fat: 0, portion: 150, category: 'Овощи' },
  { name: 'Морковь', emoji: '🥕', cal100: 41, protein: 1, carbs: 9, fat: 0, portion: 100, category: 'Овощи' },
  { name: 'Свёкла', emoji: '🫚', cal100: 43, protein: 2, carbs: 9, fat: 0, portion: 100, category: 'Овощи' },
  { name: 'Лук репчатый', emoji: '🧅', cal100: 41, protein: 1, carbs: 9, fat: 0, portion: 80, category: 'Овощи' },
  { name: 'Перец болгарский', emoji: '🫑', cal100: 27, protein: 1, carbs: 5, fat: 0, portion: 100, category: 'Овощи' },
  { name: 'Брокколи', emoji: '🥦', cal100: 34, protein: 3, carbs: 5, fat: 0, portion: 150, category: 'Овощи' },
  { name: 'Кабачок', emoji: '🫛', cal100: 24, protein: 1, carbs: 4, fat: 0, portion: 150, category: 'Овощи' },
  { name: 'Тыква', emoji: '🎃', cal100: 28, protein: 1, carbs: 6, fat: 0, portion: 150, category: 'Овощи' },
  { name: 'Баклажан', emoji: '🍆', cal100: 24, protein: 1, carbs: 5, fat: 0, portion: 150, category: 'Овощи' },
  { name: 'Картофель', emoji: '🥔', cal100: 77, protein: 2, carbs: 17, fat: 0, portion: 150, category: 'Овощи' },
  { name: 'Кукуруза', emoji: '🌽', cal100: 86, protein: 3, carbs: 18, fat: 1, portion: 100, category: 'Овощи' },
  { name: 'Шпинат', emoji: '🥬', cal100: 23, protein: 3, carbs: 2, fat: 0, portion: 100, category: 'Овощи' },
  { name: 'Чеснок', emoji: '🧄', cal100: 149, protein: 6, carbs: 33, fat: 1, portion: 10, category: 'Овощи' },

  // Фрукты
  { name: 'Яблоко', emoji: '🍎', cal100: 52, protein: 0, carbs: 14, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Банан', emoji: '🍌', cal100: 89, protein: 1, carbs: 23, fat: 0, portion: 120, category: 'Фрукты' },
  { name: 'Апельсин', emoji: '🍊', cal100: 47, protein: 1, carbs: 12, fat: 0, portion: 130, category: 'Фрукты' },
  { name: 'Мандарин', emoji: '🍊', cal100: 38, protein: 1, carbs: 8, fat: 0, portion: 80, category: 'Фрукты' },
  { name: 'Груша', emoji: '🍐', cal100: 57, protein: 0, carbs: 15, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Виноград', emoji: '🍇', cal100: 69, protein: 1, carbs: 18, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Клубника', emoji: '🍓', cal100: 33, protein: 1, carbs: 8, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Арбуз', emoji: '🍉', cal100: 30, protein: 1, carbs: 8, fat: 0, portion: 300, category: 'Фрукты' },
  { name: 'Дыня', emoji: '🍈', cal100: 35, protein: 1, carbs: 8, fat: 0, portion: 200, category: 'Фрукты' },
  { name: 'Персик', emoji: '🍑', cal100: 39, protein: 1, carbs: 10, fat: 0, portion: 130, category: 'Фрукты' },
  { name: 'Слива', emoji: '🫐', cal100: 46, protein: 1, carbs: 11, fat: 0, portion: 100, category: 'Фрукты' },
  { name: 'Черника', emoji: '🫐', cal100: 57, protein: 1, carbs: 14, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Киви', emoji: '🥝', cal100: 61, protein: 1, carbs: 15, fat: 1, portion: 80, category: 'Фрукты' },
  { name: 'Манго', emoji: '🥭', cal100: 60, protein: 1, carbs: 15, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Авокадо', emoji: '🥑', cal100: 160, protein: 2, carbs: 9, fat: 15, portion: 150, category: 'Фрукты' },

  // Молочное
  { name: 'Молоко 3.2%', emoji: '🥛', cal100: 61, protein: 3, carbs: 5, fat: 3, portion: 250, category: 'Молочное' },
  { name: 'Сметана 20%', emoji: '🥛', cal100: 206, protein: 3, carbs: 4, fat: 20, portion: 50, category: 'Молочное' },
  { name: 'Сыр голландский', emoji: '🧀', cal100: 352, protein: 26, carbs: 0, fat: 27, portion: 30, category: 'Молочное' },
  { name: 'Сыр российский', emoji: '🧀', cal100: 363, protein: 24, carbs: 0, fat: 29, portion: 30, category: 'Молочное' },
  { name: 'Сыр фета', emoji: '🧀', cal100: 264, protein: 14, carbs: 1, fat: 21, portion: 50, category: 'Молочное' },
  { name: 'Сыр моцарелла', emoji: '🧀', cal100: 280, protein: 18, carbs: 2, fat: 22, portion: 50, category: 'Молочное' },
  { name: 'Йогурт греческий', emoji: '🥛', cal100: 97, protein: 9, carbs: 4, fat: 5, portion: 200, category: 'Молочное' },
  { name: 'Масло сливочное', emoji: '🧈', cal100: 748, protein: 1, carbs: 1, fat: 82, portion: 10, category: 'Молочное' },

  // Злаки и орехи
  { name: 'Грецкий орех', emoji: '🌰', cal100: 654, protein: 15, carbs: 14, fat: 65, portion: 30, category: 'Злаки и орехи' },
  { name: 'Миндаль', emoji: '🌰', cal100: 579, protein: 21, carbs: 22, fat: 50, portion: 30, category: 'Злаки и орехи' },
  { name: 'Кешью', emoji: '🌰', cal100: 553, protein: 18, carbs: 30, fat: 44, portion: 30, category: 'Злаки и орехи' },
  { name: 'Арахис', emoji: '🥜', cal100: 567, protein: 26, carbs: 16, fat: 49, portion: 30, category: 'Злаки и орехи' },
  { name: 'Семечки подсолнечника', emoji: '🌻', cal100: 582, protein: 21, carbs: 20, fat: 52, portion: 30, category: 'Злаки и орехи' },
  { name: 'Овсяные хлопья', emoji: '🌾', cal100: 366, protein: 13, carbs: 59, fat: 7, portion: 50, category: 'Злаки и орехи' },
  { name: 'Арахисовая паста', emoji: '🥜', cal100: 598, protein: 25, carbs: 20, fat: 51, portion: 30, category: 'Злаки и орехи' },
  { name: 'Мёд', emoji: '🍯', cal100: 304, protein: 0, carbs: 82, fat: 0, portion: 20, category: 'Злаки и орехи' },
  { name: 'Протеиновый батончик', emoji: '🍫', cal100: 350, protein: 25, carbs: 40, fat: 8, portion: 60, category: 'Злаки и орехи' },

  { name: 'Аварский хинкал', emoji: '🫓', cal100: 195, protein: 9, carbs: 28, fat: 6, portion: 300, category: 'Вторые блюда' },
  { name: 'Даргинский хинкал', emoji: '🫓', cal100: 210, protein: 10, carbs: 27, fat: 7, portion: 300, category: 'Вторые блюда' },
  { name: 'Лакский хинкал', emoji: '🫓', cal100: 185, protein: 8, carbs: 26, fat: 6, portion: 300, category: 'Вторые блюда' },
  { name: 'Кумыкский хинкал', emoji: '🫓', cal100: 190, protein: 10, carbs: 24, fat: 6, portion: 300, category: 'Вторые блюда' },
  { name: 'Курзе с мясом', emoji: '🥟', cal100: 260, protein: 12, carbs: 26, fat: 12, portion: 200, category: 'Вторые блюда' },
  { name: 'Курзе с творогом', emoji: '🥟', cal100: 220, protein: 11, carbs: 24, fat: 9, portion: 200, category: 'Вторые блюда' },
  { name: 'Курзе с яйцом и луком', emoji: '🥟', cal100: 230, protein: 10, carbs: 25, fat: 10, portion: 200, category: 'Вторые блюда' },
  { name: 'Чуду с мясом', emoji: '🫓', cal100: 255, protein: 11, carbs: 26, fat: 12, portion: 150, category: 'Выпечка' },
  { name: 'Чуду с зеленью', emoji: '🫓', cal100: 215, protein: 7, carbs: 27, fat: 9, portion: 150, category: 'Выпечка' },
  { name: 'Чуду с тыквой', emoji: '🫓', cal100: 195, protein: 6, carbs: 28, fat: 8, portion: 150, category: 'Выпечка' },
  { name: 'Чуду с творогом', emoji: '🫓', cal100: 225, protein: 9, carbs: 26, fat: 10, portion: 150, category: 'Выпечка' },
  { name: 'Ботишал', emoji: '🫓', cal100: 240, protein: 8, carbs: 30, fat: 10, portion: 150, category: 'Выпечка' },
  { name: 'Афар', emoji: '🫓', cal100: 230, protein: 7, carbs: 29, fat: 10, portion: 100, category: 'Выпечка' },
  { name: 'Хабизгина', emoji: '🫓', cal100: 245, protein: 7, carbs: 31, fat: 11, portion: 150, category: 'Выпечка' },
  { name: 'Урбеч из льна', emoji: '🫙', cal100: 500, protein: 18, carbs: 10, fat: 42, portion: 30, category: 'Злаки и орехи' },
  { name: 'Урбеч из семян подсолнечника', emoji: '🫙', cal100: 570, protein: 20, carbs: 12, fat: 52, portion: 30, category: 'Злаки и орехи' },
  { name: 'Урбеч из абрикосовых косточек', emoji: '🫙', cal100: 520, protein: 14, carbs: 18, fat: 46, portion: 30, category: 'Злаки и орехи' },
  { name: 'Халва дагестанская', emoji: '🍯', cal100: 490, protein: 10, carbs: 52, fat: 28, portion: 50, category: 'Десерты' },
  { name: 'Дагестанский шашлык', emoji: '🍢', cal100: 218, protein: 19, carbs: 1, fat: 15, portion: 200, category: 'Мясо и рыба' },
  { name: 'Суп из баранины', emoji: '🍲', cal100: 78, protein: 6, carbs: 4, fat: 4, portion: 350, category: 'Супы' },
  { name: 'Катых (кисломолочный)', emoji: '🥛', cal100: 58, protein: 3, carbs: 5, fat: 3, portion: 200, category: 'Молочное' },
  { name: 'Баранина тушёная', emoji: '🥩', cal100: 292, protein: 17, carbs: 0, fat: 25, portion: 200, category: 'Мясо и рыба' },

  // Фастфуд
  { name: 'Шаурма', emoji: '🌯', cal100: 218, protein: 11, carbs: 20, fat: 10, portion: 300, category: 'Фастфуд' },
  { name: 'Хот-дог', emoji: '🌭', cal100: 290, protein: 11, carbs: 24, fat: 17, portion: 150, category: 'Фастфуд' },
  { name: 'Гамбургер', emoji: '🍔', cal100: 255, protein: 12, carbs: 22, fat: 13, portion: 200, category: 'Фастфуд' },
  { name: 'Чизбургер', emoji: '🍔', cal100: 300, protein: 14, carbs: 24, fat: 16, portion: 175, category: 'Фастфуд' },
  { name: 'Пицца Маргарита', emoji: '🍕', cal100: 250, protein: 10, carbs: 28, fat: 11, portion: 200, category: 'Фастфуд' },
  { name: 'Картошка фри', emoji: '🍟', cal100: 312, protein: 4, carbs: 41, fat: 15, portion: 150, category: 'Фастфуд' },
  { name: 'Роллы Филадельфия', emoji: '🍱', cal100: 175, protein: 8, carbs: 22, fat: 6, portion: 200, category: 'Фастфуд' },
  { name: 'Роллы Калифорния', emoji: '🍱', cal100: 160, protein: 7, carbs: 20, fat: 6, portion: 200, category: 'Фастфуд' },
  { name: 'Донер-кебаб', emoji: '🌮', cal100: 230, protein: 13, carbs: 18, fat: 11, portion: 300, category: 'Фастфуд' },
  { name: 'Бургер Кинг Воппер', emoji: '🍔', cal100: 254, protein: 13, carbs: 21, fat: 13, portion: 270, category: 'Фастфуд' },
  { name: 'Наггетсы куриные', emoji: '🍗', cal100: 270, protein: 15, carbs: 17, fat: 15, portion: 100, category: 'Фастфуд' },
  { name: 'Пицца Пепперони', emoji: '🍕', cal100: 290, protein: 12, carbs: 27, fat: 14, portion: 200, category: 'Фастфуд' },
  { name: 'Пицца Четыре сыра', emoji: '🍕', cal100: 310, protein: 14, carbs: 25, fat: 16, portion: 200, category: 'Фастфуд' },
  { name: 'Сэндвич с курицей', emoji: '🥪', cal100: 230, protein: 14, carbs: 24, fat: 9, portion: 180, category: 'Фастфуд' },
  { name: 'Роллы с лососем', emoji: '🍱', cal100: 190, protein: 10, carbs: 24, fat: 6, portion: 200, category: 'Фастфуд' },
  { name: 'Суши с тунцом', emoji: '🍣', cal100: 145, protein: 9, carbs: 20, fat: 3, portion: 100, category: 'Фастфуд' },
  { name: 'Фалафель', emoji: '🧆', cal100: 333, protein: 13, carbs: 32, fat: 18, portion: 150, category: 'Фастфуд' },
  { name: 'Тако с мясом', emoji: '🌮', cal100: 230, protein: 12, carbs: 22, fat: 10, portion: 150, category: 'Фастфуд' },
  { name: 'Буррито с курицей', emoji: '🌯', cal100: 210, protein: 13, carbs: 24, fat: 7, portion: 250, category: 'Фастфуд' },
  { name: 'Картошка Айдахо', emoji: '🍟', cal100: 158, protein: 2, carbs: 20, fat: 8, portion: 200, category: 'Фастфуд' },
  { name: 'Луковые кольца', emoji: '🧅', cal100: 302, protein: 4, carbs: 37, fat: 16, portion: 100, category: 'Фастфуд' },
  { name: 'Панини с ветчиной', emoji: '🥪', cal100: 255, protein: 13, carbs: 28, fat: 10, portion: 180, category: 'Фастфуд' },
  { name: 'Мак-флурри', emoji: '🍦', cal100: 195, protein: 4, carbs: 31, fat: 6, portion: 200, category: 'Фастфуд' },
  { name: 'Картофель по-деревенски', emoji: '🥔', cal100: 175, protein: 3, carbs: 23, fat: 8, portion: 200, category: 'Фастфуд' },

  // Азиатская кухня
  { name: 'Рамен с курицей', emoji: '🍜', cal100: 95, protein: 6, carbs: 12, fat: 3, portion: 400, category: 'Азиатская кухня' },
  { name: 'Рамен с свининой', emoji: '🍜', cal100: 110, protein: 7, carbs: 12, fat: 4, portion: 400, category: 'Азиатская кухня' },
  { name: 'Фо бо', emoji: '🍜', cal100: 75, protein: 6, carbs: 9, fat: 2, portion: 400, category: 'Азиатская кухня' },
  { name: 'Том ям', emoji: '🍲', cal100: 60, protein: 5, carbs: 4, fat: 3, portion: 300, category: 'Азиатская кухня' },
  { name: 'Мисо-суп', emoji: '🍵', cal100: 40, protein: 3, carbs: 4, fat: 1, portion: 250, category: 'Азиатская кухня' },
  { name: 'Рис с яйцом по-японски', emoji: '🍚', cal100: 155, protein: 7, carbs: 22, fat: 5, portion: 200, category: 'Азиатская кухня' },
  { name: 'Онигири с лососем', emoji: '🍙', cal100: 165, protein: 7, carbs: 28, fat: 3, portion: 110, category: 'Азиатская кухня' },
  { name: 'Онигири с тунцом', emoji: '🍙', cal100: 155, protein: 8, carbs: 27, fat: 2, portion: 110, category: 'Азиатская кухня' },
  { name: 'Темпура с креветками', emoji: '🍤', cal100: 225, protein: 11, carbs: 20, fat: 11, portion: 150, category: 'Азиатская кухня' },
  { name: 'Гёдза', emoji: '🥟', cal100: 210, protein: 9, carbs: 22, fat: 9, portion: 150, category: 'Азиатская кухня' },
  { name: 'Пад тай с курицей', emoji: '🍜', cal100: 185, protein: 11, carbs: 24, fat: 5, portion: 250, category: 'Азиатская кухня' },
  { name: 'Кунг Пао с курицей', emoji: '🍗', cal100: 175, protein: 14, carbs: 10, fat: 8, portion: 250, category: 'Азиатская кухня' },
  { name: 'Жареный рис с овощами', emoji: '🍚', cal100: 165, protein: 4, carbs: 25, fat: 5, portion: 250, category: 'Азиатская кухня' },
  { name: 'Жареный рис с курицей', emoji: '🍚', cal100: 185, protein: 10, carbs: 24, fat: 5, portion: 250, category: 'Азиатская кухня' },
  { name: 'Димсам', emoji: '🥟', cal100: 195, protein: 9, carbs: 20, fat: 8, portion: 150, category: 'Азиатская кухня' },
  { name: 'Нигири с лососем', emoji: '🍣', cal100: 180, protein: 10, carbs: 22, fat: 5, portion: 120, category: 'Азиатская кухня' },
  { name: 'Маки с огурцом', emoji: '🍱', cal100: 120, protein: 3, carbs: 24, fat: 1, portion: 150, category: 'Азиатская кухня' },
  { name: 'Удон с говядиной', emoji: '🍜', cal100: 130, protein: 8, carbs: 18, fat: 3, portion: 350, category: 'Азиатская кухня' },
  { name: 'Соба с тофу', emoji: '🍜', cal100: 115, protein: 6, carbs: 18, fat: 2, portion: 300, category: 'Азиатская кухня' },
  { name: 'Карри с курицей', emoji: '🍛', cal100: 155, protein: 12, carbs: 12, fat: 6, portion: 300, category: 'Азиатская кухня' },
  { name: 'Карри с овощами', emoji: '🍛', cal100: 110, protein: 4, carbs: 14, fat: 5, portion: 300, category: 'Азиатская кухня' },
  { name: 'Тофу жареный', emoji: '🫘', cal100: 130, protein: 10, carbs: 3, fat: 9, portion: 150, category: 'Азиатская кухня' },
  { name: 'Эдамаме', emoji: '🫛', cal100: 121, protein: 11, carbs: 9, fat: 5, portion: 150, category: 'Азиатская кухня' },
  { name: 'Лапша соба сухая', emoji: '🍜', cal100: 344, protein: 14, carbs: 70, fat: 1, portion: 80, category: 'Азиатская кухня' },
  { name: 'Кимчи', emoji: '🥬', cal100: 32, protein: 2, carbs: 5, fat: 1, portion: 100, category: 'Азиатская кухня' },
  { name: 'Лапша удон сухая', emoji: '🍜', cal100: 348, protein: 12, carbs: 69, fat: 1, portion: 80, category: 'Азиатская кухня' },
  { name: 'Вонтоны с мясом', emoji: '🥟', cal100: 205, protein: 10, carbs: 22, fat: 8, portion: 150, category: 'Азиатская кухня' },
  { name: 'Чашушули', emoji: '🥘', cal100: 140, protein: 14, carbs: 4, fat: 8, portion: 250, category: 'Азиатская кухня' },

  // Итальянская кухня
  { name: 'Паста Карбонара', emoji: '🍝', cal100: 370, protein: 15, carbs: 40, fat: 17, portion: 250, category: 'Итальянская кухня' },
  { name: 'Паста Болоньезе', emoji: '🍝', cal100: 185, protein: 10, carbs: 22, fat: 7, portion: 300, category: 'Итальянская кухня' },
  { name: 'Паста Аррабиата', emoji: '🍝', cal100: 155, protein: 6, carbs: 26, fat: 4, portion: 300, category: 'Итальянская кухня' },
  { name: 'Паста Путтанеска', emoji: '🍝', cal100: 160, protein: 6, carbs: 24, fat: 5, portion: 300, category: 'Итальянская кухня' },
  { name: 'Паста с морепродуктами', emoji: '🍝', cal100: 175, protein: 12, carbs: 22, fat: 5, portion: 300, category: 'Итальянская кухня' },
  { name: 'Ризотто с грибами', emoji: '🍚', cal100: 165, protein: 5, carbs: 26, fat: 5, portion: 300, category: 'Итальянская кухня' },
  { name: 'Ризотто с курицей', emoji: '🍚', cal100: 180, protein: 10, carbs: 24, fat: 5, portion: 300, category: 'Итальянская кухня' },
  { name: 'Ризотто с морепродуктами', emoji: '🍚', cal100: 170, protein: 11, carbs: 22, fat: 5, portion: 300, category: 'Итальянская кухня' },
  { name: 'Тирамису', emoji: '🎂', cal100: 283, protein: 5, carbs: 28, fat: 17, portion: 100, category: 'Итальянская кухня' },
  { name: 'Панна котта', emoji: '🍮', cal100: 238, protein: 3, carbs: 22, fat: 16, portion: 120, category: 'Итальянская кухня' },
  { name: 'Брускетта с томатами', emoji: '🍅', cal100: 185, protein: 6, carbs: 28, fat: 5, portion: 100, category: 'Итальянская кухня' },
  { name: 'Капрезе', emoji: '🍅', cal100: 190, protein: 11, carbs: 4, fat: 15, portion: 150, category: 'Итальянская кухня' },
  { name: 'Минестроне', emoji: '🍲', cal100: 65, protein: 3, carbs: 10, fat: 2, portion: 350, category: 'Итальянская кухня' },
  { name: 'Оссобуко', emoji: '🥩', cal100: 230, protein: 20, carbs: 6, fat: 13, portion: 250, category: 'Итальянская кухня' },
  { name: 'Полпетте', emoji: '🍖', cal100: 215, protein: 14, carbs: 8, fat: 14, portion: 200, category: 'Итальянская кухня' },
  { name: 'Кростини', emoji: '🥖', cal100: 380, protein: 12, carbs: 58, fat: 12, portion: 60, category: 'Итальянская кухня' },
  { name: 'Фокачча', emoji: '🥖', cal100: 280, protein: 7, carbs: 42, fat: 9, portion: 100, category: 'Итальянская кухня' },
  { name: 'Чиабатта', emoji: '🥖', cal100: 265, protein: 9, carbs: 50, fat: 3, portion: 80, category: 'Итальянская кухня' },
  { name: 'Панини с моцареллой', emoji: '🥪', cal100: 270, protein: 12, carbs: 30, fat: 11, portion: 180, category: 'Итальянская кухня' },
  { name: 'Пицца Маринара', emoji: '🍕', cal100: 220, protein: 8, carbs: 30, fat: 8, portion: 200, category: 'Итальянская кухня' },
  { name: 'Пицца Прошутто', emoji: '🍕', cal100: 275, protein: 13, carbs: 27, fat: 12, portion: 200, category: 'Итальянская кухня' },
  { name: 'Кальцоне', emoji: '🫓', cal100: 260, protein: 11, carbs: 30, fat: 11, portion: 250, category: 'Итальянская кухня' },
  { name: 'Равиоли с рикоттой', emoji: '🥟', cal100: 240, protein: 10, carbs: 28, fat: 9, portion: 200, category: 'Итальянская кухня' },
  { name: 'Феттучини Альфредо', emoji: '🍝', cal100: 390, protein: 14, carbs: 42, fat: 19, portion: 250, category: 'Итальянская кухня' },
  { name: 'Гноки картофельные', emoji: '🥟', cal100: 165, protein: 4, carbs: 30, fat: 3, portion: 200, category: 'Итальянская кухня' },

  // Снеки
  { name: 'Чипсы Lays', emoji: '🥔', cal100: 530, protein: 7, carbs: 52, fat: 33, portion: 30, category: 'Снеки' },
  { name: 'Чипсы Pringles', emoji: '🥔', cal100: 535, protein: 5, carbs: 51, fat: 34, portion: 30, category: 'Снеки' },
  { name: 'Чипсы кукурузные', emoji: '🌽', cal100: 492, protein: 6, carbs: 63, fat: 24, portion: 30, category: 'Снеки' },
  { name: 'Сухарики ржаные', emoji: '🍞', cal100: 340, protein: 10, carbs: 68, fat: 4, portion: 30, category: 'Снеки' },
  { name: 'Сухарики со вкусом бекона', emoji: '🥓', cal100: 390, protein: 9, carbs: 60, fat: 14, portion: 40, category: 'Снеки' },
  { name: 'Крекеры', emoji: '🍘', cal100: 440, protein: 9, carbs: 66, fat: 16, portion: 30, category: 'Снеки' },
  { name: 'Рисовые хлебцы', emoji: '🍘', cal100: 381, protein: 8, carbs: 81, fat: 3, portion: 10, category: 'Снеки' },
  { name: 'Кукурузные палочки', emoji: '🌽', cal100: 407, protein: 7, carbs: 78, fat: 7, portion: 30, category: 'Снеки' },
  { name: 'Попкорн солёный', emoji: '🍿', cal100: 480, protein: 9, carbs: 60, fat: 22, portion: 30, category: 'Снеки' },
  { name: 'Попкорн сладкий', emoji: '🍿', cal100: 430, protein: 6, carbs: 72, fat: 14, portion: 30, category: 'Снеки' },
  { name: 'Мармелад', emoji: '🍬', cal100: 321, protein: 7, carbs: 77, fat: 0, portion: 50, category: 'Снеки' },
  { name: 'Ирис', emoji: '🍬', cal100: 395, protein: 4, carbs: 66, fat: 13, portion: 30, category: 'Снеки' },
  { name: 'Карамель', emoji: '🍬', cal100: 397, protein: 0, carbs: 99, fat: 0, portion: 20, category: 'Снеки' },
  { name: 'Козинак', emoji: '🌻', cal100: 530, protein: 12, carbs: 54, fat: 30, portion: 40, category: 'Снеки' },
  { name: 'Батончик Сникерс', emoji: '🍫', cal100: 488, protein: 8, carbs: 59, fat: 24, portion: 52, category: 'Снеки' },
  { name: 'Батончик Марс', emoji: '🍫', cal100: 449, protein: 4, carbs: 66, fat: 18, portion: 51, category: 'Снеки' },
  { name: 'Батончик Twix', emoji: '🍫', cal100: 495, protein: 5, carbs: 63, fat: 24, portion: 50, category: 'Снеки' },
  { name: 'Батончик KitKat', emoji: '🍫', cal100: 518, protein: 7, carbs: 60, fat: 27, portion: 41, category: 'Снеки' },
  { name: 'Шоколад Alpen Gold', emoji: '🍫', cal100: 538, protein: 7, carbs: 57, fat: 31, portion: 25, category: 'Снеки' },
  { name: 'Вафли', emoji: '🧇', cal100: 380, protein: 8, carbs: 60, fat: 12, portion: 40, category: 'Снеки' },
  { name: 'Печенье овсяное', emoji: '🍪', cal100: 440, protein: 6, carbs: 62, fat: 18, portion: 30, category: 'Снеки' },
  { name: 'Печенье шоколадное', emoji: '🍪', cal100: 480, protein: 6, carbs: 64, fat: 22, portion: 30, category: 'Снеки' },
  { name: 'Сушки', emoji: '🍩', cal100: 336, protein: 10, carbs: 69, fat: 2, portion: 30, category: 'Снеки' },
  { name: 'Бублик', emoji: '🥯', cal100: 285, protein: 8, carbs: 57, fat: 2, portion: 100, category: 'Снеки' },
  { name: 'Нут жареный', emoji: '🫘', cal100: 385, protein: 20, carbs: 45, fat: 12, portion: 30, category: 'Снеки' },
  { name: 'Кальмар сушёный', emoji: '🦑', cal100: 263, protein: 52, carbs: 4, fat: 5, portion: 30, category: 'Снеки' },
  { name: 'Рыбные снеки', emoji: '🐟', cal100: 290, protein: 45, carbs: 5, fat: 9, portion: 30, category: 'Снеки' },

  // Соусы и приправы
  { name: 'Кетчуп', emoji: '🍅', cal100: 100, protein: 2, carbs: 22, fat: 0, portion: 30, category: 'Соусы' },
  { name: 'Майонез', emoji: '🫙', cal100: 680, protein: 2, carbs: 3, fat: 74, portion: 20, category: 'Соусы' },
  { name: 'Майонез лёгкий 40%', emoji: '🫙', cal100: 390, protein: 2, carbs: 8, fat: 39, portion: 20, category: 'Соусы' },
  { name: 'Сметана в соус', emoji: '🫙', cal100: 206, protein: 3, carbs: 4, fat: 20, portion: 30, category: 'Соусы' },
  { name: 'Горчица', emoji: '🌿', cal100: 162, protein: 10, carbs: 6, fat: 11, portion: 10, category: 'Соусы' },
  { name: 'Хрен', emoji: '🌿', cal100: 59, protein: 3, carbs: 10, fat: 1, portion: 15, category: 'Соусы' },
  { name: 'Аджика', emoji: '🌶️', cal100: 59, protein: 2, carbs: 10, fat: 2, portion: 20, category: 'Соусы' },
  { name: 'Соевый соус', emoji: '🫙', cal100: 73, protein: 8, carbs: 9, fat: 0, portion: 15, category: 'Соусы' },
  { name: 'Оливковое масло', emoji: '🫒', cal100: 884, protein: 0, carbs: 0, fat: 100, portion: 10, category: 'Соусы' },
  { name: 'Подсолнечное масло', emoji: '🌻', cal100: 900, protein: 0, carbs: 0, fat: 100, portion: 10, category: 'Соусы' },
  { name: 'Сахар', emoji: '🍬', cal100: 399, protein: 0, carbs: 100, fat: 0, portion: 10, category: 'Соусы' },
  { name: 'Томатная паста', emoji: '🍅', cal100: 82, protein: 4, carbs: 16, fat: 0, portion: 30, category: 'Соусы' },
  { name: 'Тахини (кунжутная паста)', emoji: '🫙', cal100: 592, protein: 17, carbs: 23, fat: 54, portion: 20, category: 'Соусы' },
  { name: 'Соус ткемали', emoji: '🫙', cal100: 88, protein: 1, carbs: 20, fat: 0, portion: 20, category: 'Соусы' },
  { name: 'Соус Табаско', emoji: '🌶️', cal100: 12, protein: 0, carbs: 1, fat: 0, portion: 5, category: 'Соусы' },
  { name: 'Соус Песто', emoji: '🌿', cal100: 370, protein: 6, carbs: 5, fat: 37, portion: 30, category: 'Соусы' },
  { name: 'Соус Терияки', emoji: '🫙', cal100: 89, protein: 5, carbs: 16, fat: 0, portion: 30, category: 'Соусы' },
  { name: 'Соус Хойсин', emoji: '🫙', cal100: 220, protein: 4, carbs: 46, fat: 2, portion: 30, category: 'Соусы' },
  { name: 'Соус BBQ', emoji: '🫙', cal100: 172, protein: 2, carbs: 38, fat: 1, portion: 30, category: 'Соусы' },
  { name: 'Соус Цезарь', emoji: '🫙', cal100: 430, protein: 4, carbs: 7, fat: 44, portion: 30, category: 'Соусы' },
  { name: 'Сальса', emoji: '🌶️', cal100: 36, protein: 1, carbs: 7, fat: 0, portion: 50, category: 'Соусы' },
  { name: 'Гуакамоле', emoji: '🥑', cal100: 160, protein: 2, carbs: 9, fat: 15, portion: 50, category: 'Соусы' },

  // Спортпит
  { name: 'Протеин сывороточный', emoji: '💪', cal100: 380, protein: 75, carbs: 8, fat: 4, portion: 30, category: 'Спортпит' },
  { name: 'Протеин казеиновый', emoji: '💪', cal100: 360, protein: 78, carbs: 5, fat: 2, portion: 30, category: 'Спортпит' },
  { name: 'Гейнер', emoji: '💪', cal100: 385, protein: 25, carbs: 65, fat: 3, portion: 100, category: 'Спортпит' },
  { name: 'BCAA порошок', emoji: '💊', cal100: 200, protein: 40, carbs: 8, fat: 0, portion: 10, category: 'Спортпит' },
  { name: 'Креатин', emoji: '💊', cal100: 0, protein: 0, carbs: 0, fat: 0, portion: 5, category: 'Спортпит' },
  { name: 'Протеиновый коктейль', emoji: '🥤', cal100: 65, protein: 10, carbs: 5, fat: 1, portion: 300, category: 'Спортпит' },
  { name: 'Протеиновый батончик Quest', emoji: '🍫', cal100: 370, protein: 20, carbs: 26, fat: 12, portion: 60, category: 'Спортпит' },
  { name: 'Изотоник', emoji: '🥤', cal100: 24, protein: 0, carbs: 6, fat: 0, portion: 500, category: 'Спортпит' },
  { name: 'Энергетик', emoji: '🥤', cal100: 45, protein: 0, carbs: 11, fat: 0, portion: 250, category: 'Спортпит' },
  { name: 'Протеиновый йогурт', emoji: '🥛', cal100: 75, protein: 10, carbs: 6, fat: 1, portion: 200, category: 'Спортпит' },
  { name: 'Творог SKYR', emoji: '🥛', cal100: 65, protein: 11, carbs: 4, fat: 0, portion: 200, category: 'Спортпит' },
  { name: 'Яичный белок (пастеризованный)', emoji: '🥚', cal100: 52, protein: 11, carbs: 1, fat: 0, portion: 100, category: 'Спортпит' },
  { name: 'Протеиновое печенье', emoji: '🍪', cal100: 370, protein: 25, carbs: 38, fat: 10, portion: 50, category: 'Спортпит' },
  { name: 'Л-карнитин (напиток)', emoji: '🥤', cal100: 7, protein: 0, carbs: 2, fat: 0, portion: 500, category: 'Спортпит' },

  // Дополнительные супы
  { name: 'Лагман', emoji: '🍜', cal100: 85, protein: 5, carbs: 10, fat: 3, portion: 350, category: 'Супы' },
  { name: 'Суп с чечевицей', emoji: '🫘', cal100: 70, protein: 5, carbs: 9, fat: 2, portion: 300, category: 'Супы' },
  { name: 'Пицца-суп', emoji: '🍲', cal100: 72, protein: 4, carbs: 8, fat: 3, portion: 300, category: 'Супы' },
  { name: 'Крем-суп из брокколи', emoji: '🥦', cal100: 55, protein: 3, carbs: 6, fat: 3, portion: 300, category: 'Супы' },
  { name: 'Суп с фасолью', emoji: '🫘', cal100: 75, protein: 5, carbs: 10, fat: 2, portion: 300, category: 'Супы' },
  { name: 'Суп минестроне', emoji: '🍲', cal100: 65, protein: 3, carbs: 10, fat: 2, portion: 350, category: 'Супы' },
  { name: 'Бозбаш', emoji: '🍲', cal100: 82, protein: 6, carbs: 5, fat: 4, portion: 350, category: 'Супы' },
  { name: 'Шурпа', emoji: '🍲', cal100: 90, protein: 6, carbs: 6, fat: 4, portion: 400, category: 'Супы' },
  { name: 'Пити', emoji: '🍲', cal100: 95, protein: 7, carbs: 5, fat: 5, portion: 350, category: 'Супы' },

  // Дополнительные завтраки
  { name: 'Французский тост', emoji: '🍞', cal100: 230, protein: 9, carbs: 28, fat: 9, portion: 120, category: 'Завтраки' },
  { name: 'Авокадо-тост', emoji: '🥑', cal100: 210, protein: 7, carbs: 22, fat: 11, portion: 150, category: 'Завтраки' },
  { name: 'Смузи боул', emoji: '🫐', cal100: 130, protein: 4, carbs: 22, fat: 4, portion: 300, category: 'Завтраки' },
  { name: 'Гранола', emoji: '🌾', cal100: 420, protein: 9, carbs: 65, fat: 14, portion: 60, category: 'Завтраки' },
  { name: 'Йогурт с ягодами', emoji: '🫐', cal100: 85, protein: 5, carbs: 12, fat: 2, portion: 200, category: 'Завтраки' },
  { name: 'Чиа-пудинг', emoji: '🥛', cal100: 140, protein: 5, carbs: 12, fat: 8, portion: 200, category: 'Завтраки' },
  { name: 'Панкейки', emoji: '🥞', cal100: 250, protein: 7, carbs: 35, fat: 9, portion: 150, category: 'Завтраки' },
  { name: 'Яйцо пашот', emoji: '🥚', cal100: 155, protein: 13, carbs: 1, fat: 11, portion: 55, category: 'Завтраки' },
  { name: 'Яйца Бенедикт', emoji: '🍳', cal100: 220, protein: 12, carbs: 16, fat: 12, portion: 200, category: 'Завтраки' },
  { name: 'Каша кукурузная', emoji: '🌽', cal100: 85, protein: 2, carbs: 16, fat: 1, portion: 250, category: 'Завтраки' },
  { name: 'Кукурузные хлопья с молоком', emoji: '🥣', cal100: 140, protein: 4, carbs: 27, fat: 2, portion: 200, category: 'Завтраки' },
  { name: 'Рисовая каша на молоке', emoji: '🥣', cal100: 97, protein: 3, carbs: 16, fat: 2, portion: 250, category: 'Завтраки' },

  // Дополнительное молочное
  { name: 'Сыр Пармезан', emoji: '🧀', cal100: 431, protein: 38, carbs: 0, fat: 29, portion: 15, category: 'Молочное' },
  { name: 'Сыр Бри', emoji: '🧀', cal100: 334, protein: 21, carbs: 0, fat: 28, portion: 30, category: 'Молочное' },
  { name: 'Сыр Камамбер', emoji: '🧀', cal100: 300, protein: 20, carbs: 0, fat: 24, portion: 30, category: 'Молочное' },
  { name: 'Рикотта', emoji: '🧀', cal100: 174, protein: 11, carbs: 3, fat: 13, portion: 100, category: 'Молочное' },
  { name: 'Маскарпоне', emoji: '🧀', cal100: 430, protein: 5, carbs: 4, fat: 45, portion: 50, category: 'Молочное' },
  { name: 'Крем-сыр Филадельфия', emoji: '🧀', cal100: 342, protein: 6, carbs: 4, fat: 34, portion: 30, category: 'Молочное' },
  { name: 'Кефир 1%', emoji: '🥛', cal100: 40, protein: 3, carbs: 5, fat: 1, portion: 250, category: 'Молочное' },
  { name: 'Молоко обезжиренное', emoji: '🥛', cal100: 36, protein: 3, carbs: 5, fat: 0, portion: 250, category: 'Молочное' },
  { name: 'Растительное молоко (овсяное)', emoji: '🥛', cal100: 45, protein: 1, carbs: 7, fat: 2, portion: 250, category: 'Молочное' },
  { name: 'Миндальное молоко', emoji: '🥛', cal100: 30, protein: 1, carbs: 3, fat: 2, portion: 250, category: 'Молочное' },
  { name: 'Сливки 10%', emoji: '🥛', cal100: 115, protein: 3, carbs: 4, fat: 10, portion: 50, category: 'Молочное' },
  { name: 'Сливки 20%', emoji: '🥛', cal100: 207, protein: 3, carbs: 4, fat: 20, portion: 50, category: 'Молочное' },

  // Дополнительные овощи
  { name: 'Авокадо (фрукт-овощ)', emoji: '🥑', cal100: 160, protein: 2, carbs: 9, fat: 15, portion: 150, category: 'Овощи' },
  { name: 'Спаржа', emoji: '🌿', cal100: 20, protein: 2, carbs: 4, fat: 0, portion: 150, category: 'Овощи' },
  { name: 'Сельдерей', emoji: '🌿', cal100: 16, protein: 1, carbs: 3, fat: 0, portion: 100, category: 'Овощи' },
  { name: 'Редис', emoji: '🌿', cal100: 16, protein: 1, carbs: 3, fat: 0, portion: 100, category: 'Овощи' },
  { name: 'Зелёный горошек', emoji: '🫛', cal100: 81, protein: 5, carbs: 14, fat: 0, portion: 100, category: 'Овощи' },
  { name: 'Артишок', emoji: '🌿', cal100: 47, protein: 3, carbs: 11, fat: 0, portion: 120, category: 'Овощи' },
  { name: 'Цветная капуста', emoji: '🥦', cal100: 25, protein: 2, carbs: 5, fat: 0, portion: 150, category: 'Овощи' },
  { name: 'Брюссельская капуста', emoji: '🥦', cal100: 43, protein: 3, carbs: 9, fat: 0, portion: 150, category: 'Овощи' },
  { name: 'Пекинская капуста', emoji: '🥬', cal100: 16, protein: 1, carbs: 3, fat: 0, portion: 150, category: 'Овощи' },
  { name: 'Грибы шампиньоны', emoji: '🍄', cal100: 27, protein: 4, carbs: 1, fat: 1, portion: 100, category: 'Овощи' },
  { name: 'Грибы вешенки', emoji: '🍄', cal100: 38, protein: 3, carbs: 6, fat: 1, portion: 100, category: 'Овощи' },
  { name: 'Грибы белые', emoji: '🍄', cal100: 34, protein: 4, carbs: 3, fat: 1, portion: 100, category: 'Овощи' },
  { name: 'Имбирь', emoji: '🌿', cal100: 80, protein: 2, carbs: 18, fat: 1, portion: 10, category: 'Овощи' },
  { name: 'Руккола', emoji: '🥬', cal100: 25, protein: 3, carbs: 4, fat: 1, portion: 50, category: 'Овощи' },
  { name: 'Шпинат свежий', emoji: '🥬', cal100: 23, protein: 3, carbs: 2, fat: 0, portion: 100, category: 'Овощи' },

  // Дополнительные фрукты
  { name: 'Ананас', emoji: '🍍', cal100: 50, protein: 1, carbs: 13, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Папайя', emoji: '🍈', cal100: 43, protein: 1, carbs: 11, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Гранат', emoji: '🍎', cal100: 83, protein: 2, carbs: 19, fat: 1, portion: 150, category: 'Фрукты' },
  { name: 'Инжир', emoji: '🍈', cal100: 74, protein: 1, carbs: 19, fat: 0, portion: 100, category: 'Фрукты' },
  { name: 'Хурма', emoji: '🍊', cal100: 70, protein: 1, carbs: 19, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Вишня', emoji: '🍒', cal100: 52, protein: 1, carbs: 13, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Черешня', emoji: '🍒', cal100: 52, protein: 1, carbs: 13, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Малина', emoji: '🍓', cal100: 52, protein: 1, carbs: 12, fat: 1, portion: 150, category: 'Фрукты' },
  { name: 'Смородина чёрная', emoji: '🫐', cal100: 44, protein: 1, carbs: 11, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Крыжовник', emoji: '🍈', cal100: 44, protein: 1, carbs: 10, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Абрикос', emoji: '🍑', cal100: 48, protein: 1, carbs: 11, fat: 0, portion: 100, category: 'Фрукты' },
  { name: 'Нектарин', emoji: '🍑', cal100: 44, protein: 1, carbs: 11, fat: 0, portion: 130, category: 'Фрукты' },
  { name: 'Лимон', emoji: '🍋', cal100: 29, protein: 1, carbs: 9, fat: 0, portion: 30, category: 'Фрукты' },
  { name: 'Грейпфрут', emoji: '🍊', cal100: 42, protein: 1, carbs: 11, fat: 0, portion: 150, category: 'Фрукты' },
  { name: 'Финики', emoji: '🌴', cal100: 277, protein: 2, carbs: 75, fat: 0, portion: 30, category: 'Фрукты' },
  { name: 'Чернослив', emoji: '🫐', cal100: 240, protein: 2, carbs: 58, fat: 0, portion: 30, category: 'Фрукты' },
  { name: 'Курага', emoji: '🍑', cal100: 241, protein: 3, carbs: 63, fat: 0, portion: 30, category: 'Фрукты' },
  { name: 'Изюм', emoji: '🍇', cal100: 299, protein: 3, carbs: 79, fat: 0, portion: 30, category: 'Фрукты' },

  // Дополнительные напитки
  { name: 'Зелёный чай', emoji: '🍵', cal100: 1, protein: 0, carbs: 0, fat: 0, portion: 250, category: 'Напитки' },
  { name: 'Чай с сахаром', emoji: '🍵', cal100: 30, protein: 0, carbs: 8, fat: 0, portion: 250, category: 'Напитки' },
  { name: 'Латте', emoji: '☕', cal100: 70, protein: 4, carbs: 7, fat: 3, portion: 300, category: 'Напитки' },
  { name: 'Американо', emoji: '☕', cal100: 5, protein: 0, carbs: 0, fat: 0, portion: 200, category: 'Напитки' },
  { name: 'Эспрессо', emoji: '☕', cal100: 9, protein: 0, carbs: 0, fat: 0, portion: 30, category: 'Напитки' },
  { name: 'Какао на молоке', emoji: '🍫', cal100: 100, protein: 4, carbs: 14, fat: 4, portion: 200, category: 'Напитки' },
  { name: 'Смузи из банана', emoji: '🍌', cal100: 95, protein: 2, carbs: 20, fat: 1, portion: 300, category: 'Напитки' },
  { name: 'Смузи из клубники', emoji: '🍓', cal100: 65, protein: 2, carbs: 14, fat: 0, portion: 300, category: 'Напитки' },
  { name: 'Томатный сок', emoji: '🍅', cal100: 18, protein: 1, carbs: 4, fat: 0, portion: 200, category: 'Напитки' },
  { name: 'Виноградный сок', emoji: '🍇', cal100: 54, protein: 0, carbs: 14, fat: 0, portion: 200, category: 'Напитки' },
  { name: 'Морс клюквенный', emoji: '🍹', cal100: 47, protein: 0, carbs: 12, fat: 0, portion: 250, category: 'Напитки' },
  { name: 'Лимонад', emoji: '🍋', cal100: 42, protein: 0, carbs: 11, fat: 0, portion: 250, category: 'Напитки' },
  { name: 'Кола', emoji: '🥤', cal100: 42, protein: 0, carbs: 11, fat: 0, portion: 250, category: 'Напитки' },
  { name: 'Минеральная вода', emoji: '💧', cal100: 0, protein: 0, carbs: 0, fat: 0, portion: 250, category: 'Напитки' },
  { name: 'Протеиновый шейк', emoji: '🥤', cal100: 120, protein: 20, carbs: 8, fat: 2, portion: 300, category: 'Напитки' },

  // Дополнительная мясо и рыба
  { name: 'Креветки варёные', emoji: '🍤', cal100: 99, protein: 21, carbs: 0, fat: 1, portion: 150, category: 'Мясо и рыба' },
  { name: 'Кальмар варёный', emoji: '🦑', cal100: 110, protein: 22, carbs: 2, fat: 2, portion: 150, category: 'Мясо и рыба' },
  { name: 'Мидии', emoji: '🐚', cal100: 86, protein: 12, carbs: 4, fat: 2, portion: 150, category: 'Мясо и рыба' },
  { name: 'Гребешок', emoji: '🐚', cal100: 88, protein: 16, carbs: 3, fat: 1, portion: 150, category: 'Мясо и рыба' },
  { name: 'Осьминог', emoji: '🐙', cal100: 82, protein: 15, carbs: 2, fat: 1, portion: 150, category: 'Мясо и рыба' },
  { name: 'Дорадо', emoji: '🐟', cal100: 96, protein: 20, carbs: 0, fat: 2, portion: 200, category: 'Мясо и рыба' },
  { name: 'Сибас', emoji: '🐟', cal100: 97, protein: 20, carbs: 0, fat: 2, portion: 200, category: 'Мясо и рыба' },
  { name: 'Форель', emoji: '🐟', cal100: 147, protein: 19, carbs: 0, fat: 8, portion: 150, category: 'Мясо и рыба' },
  { name: 'Минтай', emoji: '🐟', cal100: 72, protein: 16, carbs: 0, fat: 1, portion: 150, category: 'Мясо и рыба' },
  { name: 'Карп', emoji: '🐟', cal100: 112, protein: 16, carbs: 0, fat: 5, portion: 200, category: 'Мясо и рыба' },
  { name: 'Говяжий стейк', emoji: '🥩', cal100: 245, protein: 26, carbs: 0, fat: 16, portion: 200, category: 'Мясо и рыба' },
  { name: 'Свиная отбивная', emoji: '🥩', cal100: 280, protein: 22, carbs: 5, fat: 19, portion: 180, category: 'Мясо и рыба' },
  { name: 'Куриные крылья', emoji: '🍗', cal100: 220, protein: 17, carbs: 0, fat: 16, portion: 150, category: 'Мясо и рыба' },
  { name: 'Куриная голень', emoji: '🍗', cal100: 195, protein: 19, carbs: 0, fat: 13, portion: 120, category: 'Мясо и рыба' },
  { name: 'Утка', emoji: '🦆', cal100: 337, protein: 16, carbs: 0, fat: 29, portion: 150, category: 'Мясо и рыба' },
  { name: 'Кролик', emoji: '🐇', cal100: 183, protein: 21, carbs: 0, fat: 11, portion: 200, category: 'Мясо и рыба' },
  { name: 'Говяжий фарш', emoji: '🥩', cal100: 250, protein: 18, carbs: 0, fat: 20, portion: 150, category: 'Мясо и рыба' },
  { name: 'Куриный фарш', emoji: '🍗', cal100: 145, protein: 18, carbs: 0, fat: 8, portion: 150, category: 'Мясо и рыба' },
  { name: 'Бекон', emoji: '🥓', cal100: 541, protein: 37, carbs: 0, fat: 43, portion: 30, category: 'Мясо и рыба' },
  { name: 'Буженина', emoji: '🥩', cal100: 285, protein: 17, carbs: 0, fat: 23, portion: 80, category: 'Мясо и рыба' },

  // Готовая еда из магазина
  { name: 'Пюре быстрого приготовления', emoji: '🥔', cal100: 330, protein: 8, carbs: 72, fat: 1, portion: 200, category: 'Гарниры' },
  { name: 'Лапша быстрого приготовления', emoji: '🍜', cal100: 450, protein: 10, carbs: 64, fat: 17, portion: 75, category: 'Гарниры' },
  { name: 'Рис в пакетике варёный', emoji: '🍚', cal100: 116, protein: 2, carbs: 25, fat: 0, portion: 200, category: 'Гарниры' },
  { name: 'Гречка в пакетике', emoji: '🌾', cal100: 132, protein: 5, carbs: 25, fat: 2, portion: 200, category: 'Гарниры' },
  { name: 'Замороженные вареники', emoji: '🥟', cal100: 225, protein: 8, carbs: 30, fat: 8, portion: 200, category: 'Вторые блюда' },
  { name: 'Замороженные пельмени', emoji: '🥟', cal100: 275, protein: 12, carbs: 28, fat: 13, portion: 200, category: 'Вторые блюда' },
  { name: 'Консервированный тунец', emoji: '🐟', cal100: 130, protein: 28, carbs: 0, fat: 2, portion: 185, category: 'Мясо и рыба' },
  { name: 'Консервированная сардина', emoji: '🐟', cal100: 190, protein: 18, carbs: 0, fat: 13, portion: 150, category: 'Мясо и рыба' },
  { name: 'Консервированная фасоль', emoji: '🫘', cal100: 95, protein: 6, carbs: 14, fat: 1, portion: 200, category: 'Гарниры' },
  { name: 'Консервированный горошек', emoji: '🫛', cal100: 73, protein: 4, carbs: 13, fat: 0, portion: 100, category: 'Овощи' },
  { name: 'Консервированная кукуруза', emoji: '🌽', cal100: 83, protein: 3, carbs: 18, fat: 1, portion: 100, category: 'Овощи' },
]

// Emoji map for API results
function getEmojiForFood(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('курица') || n.includes('chicken')) return '🍗'
  if (n.includes('рыб') || n.includes('fish') || n.includes('лосос') || n.includes('тунец')) return '🐟'
  if (n.includes('мясо') || n.includes('говяд') || n.includes('свинина') || n.includes('beef')) return '🥩'
  if (n.includes('молоко') || n.includes('milk') || n.includes('кефир')) return '🥛'
  if (n.includes('сыр') || n.includes('cheese')) return '🧀'
  if (n.includes('яйц') || n.includes('egg')) return '🥚'
  if (n.includes('хлеб') || n.includes('bread')) return '🍞'
  if (n.includes('рис') || n.includes('rice')) return '🍚'
  if (n.includes('макарон') || n.includes('pasta') || n.includes('лапш')) return '🍝'
  if (n.includes('суп') || n.includes('soup') || n.includes('борщ') || n.includes('щи')) return '🍲'
  if (n.includes('сала') || n.includes('salad')) return '🥗'
  if (n.includes('пицц') || n.includes('pizza')) return '🍕'
  if (n.includes('торт') || n.includes('cake') || n.includes('десерт')) return '🎂'
  if (n.includes('шоколад') || n.includes('chocolate')) return '🍫'
  if (n.includes('йогурт') || n.includes('yogurt')) return '🥛'
  if (n.includes('сок') || n.includes('juice')) return '🧃'
  if (n.includes('кофе') || n.includes('coffee')) return '☕'
  if (n.includes('чай') || n.includes('tea')) return '🍵'
  if (n.includes('орех') || n.includes('nut')) return '🌰'
  if (n.includes('яблок') || n.includes('apple')) return '🍎'
  if (n.includes('банан') || n.includes('banana')) return '🍌'
  if (n.includes('огурец') || n.includes('cucumber')) return '🥒'
  if (n.includes('помидор') || n.includes('tomato')) return '🍅'
  if (n.includes('морков') || n.includes('carrot')) return '🥕'
  if (n.includes('картофел') || n.includes('potato')) return '🥔'
  return '🍽️'
}

type Props = {
  onBack: () => void
  onAdd: (item: { name: string; calories: number; protein: number; carbs: number; fat: number; emoji: string; grams: number; meal_type: string }) => void
}

export default function FoodDBScreen({ onBack, onAdd }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Все')
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState('')
  const [apiResults, setApiResults] = useState<FoodItem[]>([])
  const [apiLoading, setApiLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [barcodeLoading, setBarcodeLoading] = useState(false)
  const [barcodeError, setBarcodeError] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [mealType, setMealType] = useState(() => {
    const h = new Date().getHours()
    if (h >= 6 && h < 11) return 'breakfast'
    if (h >= 11 && h < 15) return 'lunch'
    if (h >= 15 && h < 20) return 'dinner'
    return 'snack'
  })

  const MEAL_TYPES = [
    { key: 'breakfast', label: 'Завтрак', emoji: '🌅' },
    { key: 'lunch', label: 'Обед', emoji: '☀️' },
    { key: 'dinner', label: 'Ужин', emoji: '🌙' },
    { key: 'snack', label: 'Перекус', emoji: '🍎' },
  ]

  const localFiltered = FOODS.filter(f => {
    const matchCat = category === 'Все' || f.category === category
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // Search Open Food Facts when query is 2+ chars
  useEffect(() => {
    if (search.length < 2) {
      setApiResults([])
      return
    }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      setApiLoading(true)
      try {
        const res = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(search)}&search_simple=1&action=process&json=1&page_size=10&lc=ru`
        )
        const data = await res.json()
        const items: FoodItem[] = (data.products || [])
          .filter((p: any) => p.product_name && p.nutriments?.['energy-kcal_100g'])
          .slice(0, 8)
          .map((p: any) => ({
            name: p.product_name_ru || p.product_name,
            emoji: getEmojiForFood(p.product_name_ru || p.product_name || ''),
            cal100: Math.round(p.nutriments['energy-kcal_100g'] || 0),
            protein: Math.round(p.nutriments.proteins_100g || 0),
            carbs: Math.round(p.nutriments.carbohydrates_100g || 0),
            fat: Math.round(p.nutriments.fat_100g || 0),
            portion: 100,
            category: 'Из базы',
            fromApi: true,
          }))
        setApiResults(items)
      } catch {
        setApiResults([])
      } finally {
        setApiLoading(false)
      }
    }, 600)
  }, [search])

  const handleBarcodeResult = (result: { name: string; calories: number; protein: number; carbs: number; fat: number }) => {
    setShowScanner(false)
    const food: FoodItem = {
      name: result.name,
      emoji: getEmojiForFood(result.name),
      cal100: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      portion: 100,
      category: 'Из базы',
      fromApi: true,
    }
    setSelected(food)
    setGrams('100')
  }

  const handleSelect = (food: FoodItem) => {
    setSelected(food)
    setGrams(String(food.portion))
  }

  const handleAdd = () => {
    if (!selected) return
    const g = parseInt(grams) || selected.portion
    const ratio = g / 100
    onAdd({
      name: selected.name,
      calories: Math.round(selected.cal100 * ratio),
      protein: Math.round(selected.protein * ratio),
      carbs: Math.round(selected.carbs * ratio),
      fat: Math.round(selected.fat * ratio),
      emoji: selected.emoji,
      grams: g,
      meal_type: mealType,
    })
    setSelected(null)
  }

  const showApiSection = search.length >= 2 && (apiLoading || apiResults.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack}><ChevronLeft size={24} className="text-gray-400" /></button>
          <h1 className="text-xl font-bold flex-1">Справочник калорий</h1>
          <button
            onClick={() => { setShowScanner(true); setBarcodeError('') }}
            className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-medium active:bg-orange-600"
          >
            <ScanLine size={15} />
            Штрихкод
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по базе и интернету..."
            className="w-full bg-gray-100 rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:bg-white focus:border focus:border-orange-300"
          />
          {(apiLoading || barcodeLoading) && (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 animate-spin" />
          )}
        </div>
        {barcodeError && (
          <p className="text-xs text-red-500 mt-2">{barcodeError}</p>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto flex-shrink-0 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${category === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 shadow-sm'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="space-y-2">
          {/* Local results */}
          {localFiltered.map((food, i) => (
            <FoodCard key={i} food={food} onSelect={handleSelect} />
          ))}

          {/* API results */}
          {showApiSection && (
            <>
              <div className="flex items-center gap-2 py-2 mt-2">
                <Globe size={14} className="text-blue-400" />
                <span className="text-xs font-medium text-blue-500">Результаты из интернет-базы</span>
                <div className="flex-1 h-px bg-blue-100" />
              </div>
              {apiLoading ? (
                <div className="text-center py-4">
                  <Loader2 size={20} className="animate-spin text-orange-400 mx-auto" />
                  <p className="text-xs text-gray-400 mt-1">Ищем в мировой базе...</p>
                </div>
              ) : (
                apiResults.map((food, i) => (
                  <FoodCard key={`api-${i}`} food={food} onSelect={handleSelect} isApi />
                ))
              )}
            </>
          )}

          {localFiltered.length === 0 && !showApiSection && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🔍</div>
              <p>Ничего не найдено</p>
              <p className="text-xs mt-1">Введите 2+ символа для поиска в интернете</p>
            </div>
          )}
        </div>
      </div>

      {/* Portion modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl">{selected.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg leading-tight truncate">{selected.name}</p>
                <p className="text-gray-400 text-sm">{selected.cal100} ккал на 100г</p>
                {selected.fromApi && (
                  <span className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
                    <Globe size={10} /> Open Food Facts
                  </span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-2 block">Приём пищи</label>
              <div className="flex gap-2">
                {MEAL_TYPES.map(t => (
                  <button key={t.key} onClick={() => setMealType(t.key)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${mealType === t.key ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-500 border-gray-200'}`}>
                    {t.emoji}<br/>{t.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="text-sm text-gray-500 mb-1 block">Сколько грамм?</label>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setGrams(String(Math.max(10, (parseInt(grams) || 100) - 10)))}
                className="w-10 h-10 rounded-xl border border-gray-200 text-gray-500 text-lg font-bold flex items-center justify-center">−</button>
              <input type="number" value={grams} onChange={e => setGrams(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-center outline-none focus:border-orange-400" />
              <button onClick={() => setGrams(String((parseInt(grams) || 100) + 10))}
                className="w-10 h-10 rounded-xl border border-gray-200 text-gray-500 text-lg font-bold flex items-center justify-center">+</button>
              <span className="text-gray-400 text-sm">г</span>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 mb-4 text-center">
              <p className="text-2xl font-bold text-orange-500">
                {Math.round(selected.cal100 * (parseInt(grams) || selected.portion) / 100)} ккал
              </p>
              <p className="text-xs text-gray-400">
                Б:{Math.round(selected.protein * (parseInt(grams) || selected.portion) / 100)}г·
                У:{Math.round(selected.carbs * (parseInt(grams) || selected.portion) / 100)}г·
                Ж:{Math.round(selected.fat * (parseInt(grams) || selected.portion) / 100)}г
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 border border-gray-200 rounded-xl py-3 text-gray-500">Отмена</button>
              <button onClick={handleAdd} className="flex-1 bg-orange-500 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2">
                <Plus size={18} /> Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode scanner */}
      {showScanner && (
        <BarcodeScanner
          onResult={handleBarcodeResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}

function FoodCard({ food, onSelect, isApi }: { food: FoodItem; onSelect: (f: FoodItem) => void; isApi?: boolean }) {
  return (
    <button onClick={() => onSelect(food)}
      className={`w-full bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm text-left active:bg-orange-50 transition-colors ${isApi ? 'border border-blue-100' : ''}`}>
      <span className="text-2xl w-10 text-center">{food.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{food.name}</p>
        <p className="text-xs text-gray-400">Б:{food.protein}г У:{food.carbs}г Ж:{food.fat}г · {food.portion}г</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-gray-900">{Math.round(food.cal100 * food.portion / 100)}</p>
        <p className="text-xs text-gray-400">ккал</p>
      </div>
    </button>
  )
}
