<?php

declare(strict_types=1);

namespace App\Tests\Common\Twig\Components;

use App\Common\Twig\Components\Card;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\UX\TwigComponent\Test\InteractsWithTwigComponents;

final class CardTest extends KernelTestCase
{
    use InteractsWithTwigComponents;

    public function testMountsWithoutLink(): void
    {
        $component = $this->mountTwigComponent(Card::class, ['title' => 'Titre']);

        self::assertInstanceOf(Card::class, $component);
        self::assertSame('Titre', $component->title);
        self::assertFalse($component->hasLink());
    }

    public function testRendersLinkAndContent(): void
    {
        $rendered = $this->renderTwigComponent(
            Card::class,
            ['title' => 'Titre', 'href' => '/cible'],
            'Contenu',
        );

        self::assertSame('/cible', $rendered->crawler()->filter('.card__title a')->attr('href'));
        self::assertStringContainsString('Contenu', $rendered->crawler()->filter('.card__content')->text());
    }
}
