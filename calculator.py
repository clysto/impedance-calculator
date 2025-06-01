from math import pi
from typing import List
from enum import Enum


class Orientation(Enum):
    SERIES = 0
    SHUNT = 1


class Element:
    def __init__(self, orientation: Orientation):
        self.orientation = orientation

        self.z_func = lambda _: 1e-14  # function to define series impedance
        self.y_func = lambda _: 1e14  # function to define admittance

    def z(self, freq):
        return self.z_func(freq)

    def y(self, freq):
        return self.y_func(freq)


class Capacitor(Element):
    def __init__(self, val, orientation: Orientation = Orientation.SERIES, q=None):
        Element.__init__(self, orientation)
        self.val = val
        if q is None:
            # ideal capacitor
            self.y_func = lambda freq: 1j * 2 * pi * freq * self.val
            self.z_func = lambda freq: 1.0 / self.y_func(freq)
        else:
            self.q = q
            self.y_func = lambda freq: (2 * pi * freq * self.val) / self.q + 1j * 2 * pi * freq * self.val
            self.z_func = lambda freq: 1.0j / self.z_func(freq)


class Inductor(Element):
    def __init__(self, val, orientation: Orientation = Orientation.SERIES, q=None):
        Element.__init__(self, orientation)
        self.val = val
        if q is None:
            # ideal inductor
            self.z_func = lambda freq: 1j * 2 * pi * freq * self.val
            self.y_func = lambda freq: 1.0 / self.z_func(freq)
        else:
            self.q = q
            self.z_func = lambda freq: (2 * pi * freq * self.val) / self.q + 1j * 2 * pi * freq * self.val
            self.y_func = lambda freq: 1.0j / self.z_func(freq)


class Network:
    def __init__(self, zl):
        self.elements: List[Element] = []
        self.zl = lambda _: zl  # Load impedance

    def compute_impedances(self, freq):
        z_arr = [self.zl(freq)]

        for element in self.elements:
            if element.orientation == Orientation.SERIES:
                z_arr.append(z_arr[-1] + element.z(freq))
            elif element.orientation == Orientation.SHUNT:
                z_arr.append(1.0 / (1.0 / z_arr[-1] + element.y(freq)))

        return z_arr

    def add_element(self, element: Element):
        self.elements.append(element)


if __name__ == "__main__":
    import numpy as np
    import matplotlib.pyplot as plt

    net = Network(9 + 87j)

    c1 = Capacitor(4.89e-12, Orientation.SHUNT)
    l1 = Inductor(14.67e-9, Orientation.SERIES)
    c2 = Capacitor(11.001e-12, Orientation.SHUNT)

    net.add_element(c1)
    net.add_element(l1)
    net.add_element(c2)

    print(net.compute_impedances(868e6))

    freqs = np.linspace(600e6, 1500e6, 1000)
    zin_list = [net.compute_impedances(f)[-1] for f in freqs]
    z0 = 50
    s11 = [(z - z0) / (z + z0) for z in zin_list]
    s11_db = 20 * np.log10(np.abs(s11))

    plt.plot(freqs / 1e6, s11_db)
    plt.xlabel("Frequency (MHz)")
    plt.ylabel("S11 (dB)")
    plt.grid(True)
    plt.show()
