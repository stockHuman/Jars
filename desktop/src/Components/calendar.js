/**
 * MIT License
 *
 * Copyright (c) 2018 Alexey Botkov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

class Calendar extends Module {

	constructor(props) {
		super(props)
		let t = new Date()
		let today = new Date(t.getFullYear(), t.getMonth(), t.getDate() -1, 0)

		this.state = {
			year: props.year || new Date().getFullYear(),
			today
		}
		this.listeners = []
		this.info = props.info
		this.monthNames = locales('monthNames')
		this.dayNames = locales('dayNames')

		// 'mount' component
		this.render()
		this.events() // hook events
	}

	_labels() {
		let html = ''
		let y = 0

		for (let i = 0; i < 7; i++) {
			y = (i * 14);
			html += `<text class='dayLabel' x='5' y='${y}' dy='10'>${this.dayNames[i].substr(0, 1)}</text>`
		}
		return html
	}

	_month(month) {
		let html = ''
		let monthLength = new Date(this.state.year, month + 1, 0).getDate()
		let date = 0
		let x = 0
		let y = 0


		while (date < monthLength) {
			x += 14
			let week = 0

			while (week < 7 && date != monthLength) {
				y = week * 14
				let day = new Date(this.state.year, month, date, 0)
				let style = ''
				let tabIndex = `tabIndex="0"`

				if (day.getDay() != week) {
					style = 'null'
					date--
					tabIndex = `tabIndex="-1"`
				} else if (String(day) == String(this.state.today)) {
					style = 'today'
					tabIndex = `tabIndex="1"`
				}
				else if (day < this.state.today) style = 'gone'
				else if (day.getDay() == 5 || day.getDay() == 6) style = 'weekend'
				else style = 'day'

				html += `<rect class="${style}" x="${x}" y="${y}" width='12px' height='12px' rx='2' ry='2'
				details="${new Date(this.state.year, month, date + 1)}" ${tabIndex} />`
				week++
				date++
			}
		}
		return html
	}

	_emit (event, type = 'select') {
		let e = new CustomEvent(`calendar-${type}`, { detail: event.target.date } )
		document.dispatchEvent(e)
	}

	events () {
		const days = document.querySelectorAll(".graph rect:not(.null)")
		days.forEach(day => {
			day.date = day.attributes.details.value
			this.listeners.push(day)
			day.addEventListener('focus', (e) => this._emit(e))
		})
	}

	setYear (year) {
		this.state.year = year
		this.render()
		this.listeners = []
		this.events()
	}

	today () {
		let t = new Date()
		this.setState({ today: new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1, 0)})
	}

	// update text describing chosen date in calendar
	describe (selectedDay) {
		// temp? attempt to fix broken day roll-over render event
		if (!(selectedDay instanceof Date)) {
			selectedDay = new Date()
		}
		let year = selectedDay.getFullYear()
		let month = selectedDay.getMonth()
		let date = selectedDay.getDate()
		let day = selectedDay.getDay() - 1
		if (day < 0) day = 6

		let diff = ((new Date(
			new Date().getFullYear(),
			new Date().getMonth(),
			new Date().getDate(),
			0) - new Date(year, month, date)) / 86400000)
		let num = Math.abs(diff).toFixed()
		let calc

		if (diff < 0) {
			calc = `In ${num} Day${num > 1 ? 's' : ''}.`
		} else if (diff == 0) {
			calc = `Today.`
		} else {
			calc = `${num} Day${num > 1 ? 's' : ''} ago.`
		}

		this.info.innerHTML = `<p>${this.monthNames[month]} ${date}, ${this.dayNames[day]}. ${calc}</p>`
	}

	render () {
		let month = 0
		let html = ''

		while (month < 12) {
			html +=
			`<div class='month'>
				<p class='m'>${this.monthNames[new Date(this.state.year, month).getMonth()].substr(0, 3)}</p>
				<svg class='graph' id="${this.monthNames[month]}">
					${this._labels()}
					${this._month(month)}
				</svg>
			</div>`
			month++
		}

		this.root.innerHTML = `<section id="calendar">${html}</section>`
	}
}
